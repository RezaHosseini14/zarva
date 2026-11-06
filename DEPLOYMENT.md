# Deploy — zarva (SafShekan-style)

| Service | Host | Container |
|---------|------|-----------|
| nginx | `1032` | `zarva-nginx` |
| backend | `1030` → `3000` | `zarva-backend` |
| frontend | `1031` → `3000` | `zarva-frontend` |
| minio | `9030` / `9031` | `zarva-minio` |
| postgres / redis | internal | `zarva-postgres` / `zarva-redis` |

Remote: `/opt/zarva`

## Secrets

| Name | Required | Notes |
|------|----------|--------|
| `SSH_PRIVATE_KEY` | yes | Private key (full PEM) for GitHub Actions → VPS |
| `SSH_HOST` | yes | Hostname or IP the runner connects to over SSH |
| `SSH_USER` | yes | e.g. `root` |
| `GHCR_PULL_TOKEN` | if pulling from GHCR on the VPS | PAT with `read:packages` |
| `SSH_PORT` | no | SSH port (default **22**). Set if `sshd` is not on 22 |
| `TLS_HOST` | no | Hostname or IP for **HTTPS** checks and `NEXT_PUBLIC_*` on first `.env` bootstrap (defaults to `SSH_HOST`) |

CI reads **`SSH_PORT`** from secrets and passes `-p` to every `ssh`/`scp` and to `ssh-keyscan`.

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
  -subj "/CN=109.70.78.80" \
  -addext "subjectAltName=IP:109.70.78.80"
docker compose pull
docker compose up -d postgres redis minio --wait
docker compose run --rm --no-deps backend npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
docker compose run --rm --no-deps backend node --experimental-strip-types apps/backend/prisma/seed.ts
docker compose up -d --force-recreate --wait backend
docker compose up -d --force-recreate --wait frontend
docker compose up -d --force-recreate --wait nginx
docker ps --filter name=zarva
curl -kfsS https://127.0.0.1:1032/api/v1/health
```

## Rollback

Restore previous `BACKEND_IMAGE` / `FRONTEND_IMAGE` in `.env`, then recreate backend → frontend → nginx.
