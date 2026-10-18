# integrations

Shell module for ZARVA Gold Business OS. UI route: `/integrations`. Permissions seeded for entitlement gating.

- `GET /integrations/summary` — healthy/degraded/offline counts
- `POST /integrations/:id/test` — deterministic config checks (no randomness); webhooks optional HEAD probe
