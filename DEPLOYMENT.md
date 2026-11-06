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
| `SSH_PRIVATE_KEY` | for SSH deploy | Private key (full PEM) for GitHub Actions → VPS |
| `SSH_HOST` | for SSH deploy | Hostname or IP the runner connects to over SSH |
| `SSH_USER` | for SSH deploy | e.g. `root` |
| `GHCR_PULL_TOKEN` | if pulling from GHCR on the VPS | PAT with `read:packages` |
| `SSH_PORT` | no | SSH port (default **22**). Set if `sshd` is not on 22 |
| `TLS_HOST` | no | Hostname or IP for **HTTPS** checks and `NEXT_PUBLIC_*` on first `.env` bootstrap (defaults to `SSH_HOST`) |

### Repo variable (self-hosted)

| Name | Value |
|------|--------|
| `DEPLOY_RUNS_ON` | `["self-hosted","zarva"]` |

When set, the **Deploy** job runs **on the VPS runner** (no inbound SSH from GitHub). Build still uses `ubuntu-latest`.

## SSH from GitHub Actions (timeout / Permission denied)

Two separate failures:

1. **`Connection timed out`** — GitHub-hosted runners (US/EU) cannot open TCP to your VPS (panel firewall or provider geo-block). Your home PC can still connect.  
   - **Fix A (recommended):** self-hosted runner (see below).  
   - **Fix B:** open inbound **TCP 22** (or your `SSH_PORT`) to **`0.0.0.0/0`** in the VPS **panel** firewall and `ufw`.

2. **`Permission denied (publickey)`** — the CI public key is **not** in `authorized_keys` on this server (common after migrating to a new VPS).

Install the zarva CI public key (run **once** on the VPS as the SSH user, e.g. `root`, after password/console login):

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
grep -q 'zarva-github-actions' ~/.ssh/authorized_keys 2>/dev/null || \
  echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN8mffGincHJutX2pqMQpH5Nu/82aNXq37UBW7W+nkrE zarva-github-actions' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Verify from your PC:

```powershell
ssh -i $env:USERPROFILE\.ssh\id_ed25519_zarva_ci root@109.70.78.80
```

## Self-hosted runner (recommended when GitHub cannot SSH)

1. On GitHub: **Settings → Actions → Runners → New self-hosted runner** (Linux x64).  
2. On the VPS: follow the download/`./config.sh` instructions; use labels **`self-hosted`**, **`zarva`**.  
3. Repo **Settings → Variables → Actions**: create `DEPLOY_RUNS_ON` = `["self-hosted","zarva"]`.  
4. Install Docker + Compose on the VPS; ensure `/opt/zarva` is writable.  
5. Re-run the workflow.

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
