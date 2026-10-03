---
name: zarva-backend
description: >
  ZARVA NestJS 12 backend playbook (Prisma, Swagger, CASL guards, billing,
  feature modules). Use when building apps/backend APIs, DTOs, repositories,
  auth, subscriptions, or seeds.
---

# ZARVA Backend

## Stack

- NestJS 12 + Prisma + PostgreSQL + Redis + MinIO
- Validation: class-validator + ValidationPipe
- Auth: JWT access + refresh rotation, argon2id
- AuthZ: CASL via `@zarva/shared` + PoliciesGuard
- Billing: `IBillingProvider` (Stripe / Mock)
- Docs: Swagger `/api/docs`

## Always

1. Feature modules under `src/features/<domain>/`
2. Controller → service → repository; no Prisma in controllers
3. DTOs with `@ApiProperty`; map to `@zarva/shared` `I*` interfaces
4. Tenant scope every query by `organizationId`
5. Load `nestjs-best-practices` / `nestjs-expert` for deep Nest patterns

## Delegate

| Task | Skill |
| --- | --- |
| Nest patterns | `nestjs-best-practices` |
| Nest mentoring | `nestjs-expert` |
| Auth flows | `zarva-auth` |
| Billing/webhooks | `zarva-billing` |
| OpenAPI detail | `zarva-api-swagger` |
| Security review | `security-expert` / `security-review` |
