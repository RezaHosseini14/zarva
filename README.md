# ZARVA — Gold Business OS

Multi-tenant SaaS for gold and jewelry businesses. NestJS API + Next.js dashboard, Prisma/PostgreSQL, Redis, MinIO, CASL RBAC, Stripe (or mock) subscriptions.

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres redis minio
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- Frontend: http://localhost:3100
- Backend: http://localhost:4100
- Swagger: http://localhost:4100/api/docs

## Workspaces

- `apps/backend` — NestJS 12 API
- `apps/frontend` — Next.js App Router dashboard
- `packages/shared` — `@zarva/shared` interfaces + CASL ability

## Docs

See [`docs/README.md`](docs/README.md). Agent guidance: [`AGENTS.md`](AGENTS.md).
