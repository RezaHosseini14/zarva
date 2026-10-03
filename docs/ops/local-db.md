# Local DB without Docker Desktop

When Docker is not available on Windows, use Prisma Dev (project-local Postgres):

```bash
cd apps/backend
npx prisma dev --name zarva --detach
node ../../scripts/sync-prisma-dev-url.mjs   # sets DATABASE_URL to TCP …/zarva
npm run env:sync
npx prisma migrate deploy
npx prisma db seed
```

From the repo root:

```bash
npm run dev:backend
```

The Nest API uses `@prisma/adapter-pg` (see `PrismaService`) so the Prisma Dev TCP proxy does not break queries with `prepared statement already exists`.

Seeded users:

- `admin@zarva.dev` / `Password123!` — SUPER_ADMIN
- `cashier@zarva.dev` / `Password123!` — CASHIER

On the Linux server, prefer `docker compose up -d postgres` and the compose `DATABASE_URL` instead.
