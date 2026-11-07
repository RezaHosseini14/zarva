#!/usr/bin/env bash
# Runs ON the VPS in $REMOTE_DIR (default /opt/zarva).
# Required env: BACKEND_IMAGE, FRONTEND_IMAGE
# Optional: GHCR_USER, GHCR_TOKEN, TLS_HOST, REMOTE_DIR
set -euo pipefail

REMOTE_DIR="${REMOTE_DIR:-/opt/zarva}"
TLS_HOST="${TLS_HOST:-zarva.rmhosseini.ir}"
cd "$REMOTE_DIR"
unset COMPOSE_FILE COMPOSE_PATH || true
export COMPOSE_PROJECT_NAME=zarva

echo "--> Deploy host: $(hostname) pwd=$(pwd)"
echo "--> Compose ports (must include 1030/1031/1032):"
grep -nE 'ports:|1030|1031|1032' docker-compose.yml || true

if [ -z "${GHCR_TOKEN:-}" ]; then
  echo "::error::GHCR_TOKEN is empty — cannot pull private images from ghcr.io."
  echo "::error::Add repo secret GHCR_PULL_TOKEN (classic PAT with read:packages) or ensure the deploy job passes GITHUB_TOKEN."
  exit 1
fi
GHCR_LOGIN_USER="$(echo "${GHCR_USER:-}" | tr '[:upper:]' '[:lower:]')"
if ! echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_LOGIN_USER" --password-stdin; then
  echo "::error::docker login ghcr.io failed (check GHCR_PULL_TOKEN or package access for ${GHCR_LOGIN_USER})."
  exit 1
fi

touch .env
if grep -q '^BACKEND_IMAGE=' .env; then
  sed -i "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=${BACKEND_IMAGE}|" .env
else
  echo "BACKEND_IMAGE=${BACKEND_IMAGE}" >> .env
fi

if grep -q '^FRONTEND_IMAGE=' .env; then
  sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=${FRONTEND_IMAGE}|" .env
else
  echo "FRONTEND_IMAGE=${FRONTEND_IMAGE}" >> .env
fi

for kv in BACKEND_PORT=1030 FRONTEND_PORT=1031 NGINX_PORT=1032 MINIO_PUBLIC_PORT=9030 MINIO_CONSOLE_PORT=9031; do
  key=${kv%%=*}; val=${kv#*=}
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
done

if [ -z "${BACKEND_IMAGE:-}" ] || [ -z "${FRONTEND_IMAGE:-}" ]; then
  echo "::error::Build jobs did not pass backend/frontend image refs"
  exit 1
fi
echo "--> Target images: backend=${BACKEND_IMAGE} frontend=${FRONTEND_IMAGE}"
echo "--> .env image pins:"
grep -E '^(BACKEND_IMAGE|FRONTEND_IMAGE)=' .env

if ! grep -q '^POSTGRES_PASSWORD=' .env; then
  echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" >> .env
fi
if ! grep -q '^REDIS_PASSWORD=' .env; then
  echo "REDIS_PASSWORD=$(openssl rand -hex 24)" >> .env
fi
if ! grep -q '^JWT_SECRET=.\+' .env; then
  sed -i '/^JWT_SECRET=/d' .env || true
  echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env
fi
if ! grep -q '^JWT_REFRESH_SECRET=.\+' .env; then
  sed -i '/^JWT_REFRESH_SECRET=/d' .env || true
  echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)" >> .env
fi
if ! grep -q '^MINIO_ACCESS_KEY=' .env; then
  echo "MINIO_ACCESS_KEY=zarva" >> .env
fi
if ! grep -q '^MINIO_SECRET_KEY=.\+' .env; then
  sed -i '/^MINIO_SECRET_KEY=/d' .env || true
  echo "MINIO_SECRET_KEY=$(openssl rand -hex 24)" >> .env
fi
# Always keep public URLs on the Cloudflare domain (no :1032).
for kv in \
  "NEXT_PUBLIC_API_URL=https://${TLS_HOST}/api/v1" \
  "NEXT_PUBLIC_APP_URL=https://${TLS_HOST}" \
  "APP_URL=https://${TLS_HOST}" \
  "CORS_ORIGIN=https://${TLS_HOST}"; do
  key=${kv%%=*}; val=${kv#*=}
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
done

sed -i '/^API_IMAGE=/d;/^WEB_IMAGE=/d' .env || true

docker rm -f zarva-api zarva-web 2>/dev/null || true

mkdir -p docker/certs
if [ ! -s docker/certs/server.crt ] || [ ! -s docker/certs/server.key ]; then
  echo "--> Creating the self-signed TLS certificate on the host..."
  # Docker-edge self-signed (host nginx + Let's Encrypt is the public cert).
  SAN="DNS:${TLS_HOST}"
  case "${TLS_HOST}" in
    *[!0-9.]* ) ;;
    *) SAN="IP:${TLS_HOST}" ;;
  esac
  openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
    -keyout docker/certs/server.key \
    -out docker/certs/server.crt \
    -subj "/CN=${TLS_HOST}" \
    -addext "subjectAltName=${SAN}"
fi

echo "--> Pulling latest container images..."
pulled=0
for attempt in 1 2 3 4 5; do
  if docker compose -f docker-compose.yml pull backend frontend; then
    pulled=1
    break
  fi
  echo "compose pull failed (attempt ${attempt}), retrying..."
  sleep $((attempt * 4))
done
if [ "$pulled" != 1 ]; then
  echo "::error::docker compose pull failed after 5 attempts"
  exit 1
fi

echo "--> Starting Postgres, Redis, and MinIO..."
if ! docker compose -f docker-compose.yml up -d postgres redis minio --wait --wait-timeout 90; then
  echo "::error::Data layer failed to become healthy"
  docker compose -f docker-compose.yml ps || true
  docker logs zarva-postgres --tail 50 || true
  docker logs zarva-redis --tail 50 || true
  exit 1
fi

echo "--> Executing database migrations..."
if ! docker compose -f docker-compose.yml run --rm --no-deps backend \
  npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma; then
  echo "::error::Database migrations failed! Halting deployment to protect uptime."
  exit 1
fi

echo "--> Seeding database (idempotent upserts)..."
if ! docker compose -f docker-compose.yml run --rm --no-deps backend \
  node --experimental-strip-types apps/backend/prisma/seed.ts; then
  echo "::warning::Database seed failed (login users may be missing)"
fi

up_one() {
  local service="$1"
  local timeout="$2"
  echo "--> Starting ${service}..."
  if docker compose -f docker-compose.yml up -d --force-recreate --wait --wait-timeout "$timeout" "$service"; then
    return 0
  fi
  echo "--> ${service} failed; removing stale container_name and retrying once..."
  docker rm -f "zarva-${service}" 2>/dev/null || true
  docker compose -f docker-compose.yml up -d --force-recreate --wait --wait-timeout "$timeout" "$service"
}

echo "--> Recreating app tier one service at a time (DB left running)..."
if ! up_one backend 180; then
  echo "::error::backend failed to become healthy"
  docker logs zarva-backend --tail 120 || true
  exit 1
fi
if ! up_one frontend 180; then
  echo "::error::frontend failed to become healthy"
  docker logs zarva-frontend --tail 120 || true
  exit 1
fi
if ! up_one nginx 120; then
  echo "::error::nginx failed to become healthy"
  docker logs zarva-nginx --tail 120 || true
  exit 1
fi

echo "--> Asserting app containers exist and are running..."
for c in zarva-backend zarva-frontend zarva-nginx; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    echo "::error::Expected running container missing: $c"
    docker ps -a --filter name=zarva || true
    exit 1
  fi
done

echo "--> Verifying the running containers use the freshly built images..."
EXPECTED_BACKEND_ID=$(docker image inspect --format '{{.Id}}' "$BACKEND_IMAGE" 2>/dev/null || echo '')
EXPECTED_FRONTEND_ID=$(docker image inspect --format '{{.Id}}' "$FRONTEND_IMAGE" 2>/dev/null || echo '')
RUNNING_BACKEND_ID=$(docker inspect --format '{{.Image}}' zarva-backend 2>/dev/null || echo '')
RUNNING_FRONTEND_ID=$(docker inspect --format '{{.Image}}' zarva-frontend 2>/dev/null || echo '')
echo "    backend:  running=${RUNNING_BACKEND_ID} expected=${EXPECTED_BACKEND_ID} (${BACKEND_IMAGE})"
echo "    frontend: running=${RUNNING_FRONTEND_ID} expected=${EXPECTED_FRONTEND_ID} (${FRONTEND_IMAGE})"
if [ -z "$RUNNING_BACKEND_ID" ] || [ "$RUNNING_BACKEND_ID" != "$EXPECTED_BACKEND_ID" ] \
  || [ -z "$RUNNING_FRONTEND_ID" ] || [ "$RUNNING_FRONTEND_ID" != "$EXPECTED_FRONTEND_ID" ]; then
  echo "::error::Running containers are not on the built images; the deployment did not take effect"
  docker ps --filter name=zarva || true
  exit 1
fi

echo "--> Verifying published host ports (backend:1030 frontend:1031 nginx:1032)..."
docker ps --filter name=zarva --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
BACKEND_PORTS=$(docker port zarva-backend 3000/tcp 2>/dev/null || true)
FRONTEND_PORTS=$(docker port zarva-frontend 3000/tcp 2>/dev/null || true)
NGINX_PORTS=$(docker port zarva-nginx 443/tcp 2>/dev/null || true)
echo "    backend 3000/tcp -> ${BACKEND_PORTS}"
echo "    frontend 3000/tcp -> ${FRONTEND_PORTS}"
echo "    nginx 443/tcp -> ${NGINX_PORTS}"
echo "$BACKEND_PORTS" | grep -qE '(:|::)1030$' || {
  echo "::error::backend is not published on host port 1030 (got: ${BACKEND_PORTS})"
  exit 1
}
echo "$FRONTEND_PORTS" | grep -qE '(:|::)1031$' || {
  echo "::error::frontend is not published on host port 1031 (got: ${FRONTEND_PORTS})"
  exit 1
}
echo "$NGINX_PORTS" | grep -qE '(:|::)1032$' || {
  echo "::error::nginx is not published on host port 1032 (got: ${NGINX_PORTS})"
  exit 1
}

echo "--> Local health probe via nginx on the VPS..."
if ! docker exec zarva-nginx wget -qO- http://127.0.0.1/api/v1/health; then
  echo "::error::nginx local /api/v1/health failed after recreate"
  docker logs zarva-backend --tail 80 || true
  docker logs zarva-frontend --tail 80 || true
  docker logs zarva-nginx --tail 80 || true
  exit 1
fi
echo ""

echo "--> Reloading nginx so the mounted config is applied..."
reloaded=0
for attempt in $(seq 1 20); do
  if docker exec zarva-nginx nginx -s reload; then
    reloaded=1
    break
  fi
  sleep 2
done
if [ "$reloaded" != 1 ]; then
  echo "::error::nginx did not accept reload"
  docker logs zarva-nginx --tail 80 || true
  exit 1
fi

echo "--> Cleaning up unused dangling images..."
docker image prune -f || true
echo "--> Host deploy finished OK"
