# Deploy — zarva (SafShekan-style)

| Service | Host | Container |
|---------|------|-----------|
| nginx | `5032` | `zarva-nginx` |
| backend | `5030` → `3000` | `zarva-backend` |
| frontend | `5031` → `3000` | `zarva-frontend` |
| minio | `9030` / `9031` | `zarva-minio` |
| postgres / redis | internal | `zarva-postgres` / `zarva-redis` |

Remote: `/opt/zarva`

## Secrets

`SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, `GHCR_PULL_TOKEN`

## First boot

```bash
mkdir -p /opt/zarva/docker /opt/zarva/data /opt/zarva/docker/certs
cd /opt/zarva
# sync docker-compose.prod.yml → docker-compose.yml + docker/nginx.conf via Actions
cp .env.example .env   # set passwords + BACKEND_PORT/FRONTEND_PORT/NGINX_PORT
# self-signed TLS (CI also creates this if missing)
openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout docker/certs/server.key \
  -out docker/certs/server.crt \
  -subj "/CN=5.159.49.36" \
  -addext "subjectAltName=IP:5.159.49.36"
docker compose pull
docker compose up -d postgres redis minio --wait
docker compose run --rm --no-deps backend npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
docker compose up -d --force-recreate --wait backend
docker compose up -d --force-recreate --wait frontend
docker compose up -d --force-recreate --wait nginx
docker ps --filter name=zarva
curl -kfsS https://127.0.0.1:5032/api/v1/health
```

## Rollback

Restore previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then recreate backend → frontend → nginx.
