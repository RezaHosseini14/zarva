# Server deploy (Docker only — not on Windows)

Postgres / Redis / MinIO / backend / frontend run **on the Linux server via Docker Compose**. Do not install PostgreSQL on the developer Windows machine.

## Prerequisites on server

- Docker Engine + Compose plugin
- Git
- Ports open: `3100` (frontend), `4100` (API), optionally `5433`/`6380`/`9010` only if you need host access (prefer keep DB internal)

## One-shot

```bash
git clone <repo> zarva && cd zarva
cp .env.example .env
# set JWT_SECRET / JWT_REFRESH_SECRET (and Stripe keys if used)
chmod +x scripts/deploy-server.sh
./scripts/deploy-server.sh
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Demo login after seed: `admin@zarva.dev` / `Password123!`

## From your Windows PC (SSH)

```bash
ssh user@YOUR_SERVER_IP
# then run the steps above
```

Or from Windows (with OpenSSH), after you provide host/user:

```powershell
scp -r E:\main-projects\zarva user@SERVER:~/zarva
ssh user@SERVER "cd ~/zarva && ./scripts/deploy-server.sh"
```

Local Windows only runs the Next/Nest **dev** clients against `NEXT_PUBLIC_API_URL` pointing at the server API if desired.
