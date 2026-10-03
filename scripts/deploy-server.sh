#!/usr/bin/env bash
# Deploy ZARVA infra + apps on a Linux server with Docker.
# Usage (on server, from repo root):
#   chmod +x scripts/deploy-server.sh
#   ./scripts/deploy-server.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required on the server."
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit secrets before production."
fi

# Point compose services at in-network DB (already set for profile full).
docker compose up -d postgres redis minio
echo "Waiting for postgres health..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U zarva -d zarva >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

docker compose --profile full up -d --build backend frontend

echo "Stack is up."
echo "  Frontend: http://$(hostname -I | awk '{print $1}'):3100"
echo "  Backend:  http://$(hostname -I | awk '{print $1}'):4100"
echo "  Swagger:  http://$(hostname -I | awk '{print $1}'):4100/api/docs"
echo "Run migrations inside backend once:"
echo "  docker compose exec backend npx prisma migrate deploy"
echo "  docker compose exec backend npx prisma db seed"
