# Platform (Superadmin)

`SUPER_ADMIN` / `PLATFORM_ADMIN` manage tenants:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/platform/organizations` | List orgs + subscription summary |
| GET | `/platform/organizations/:id` | Detail + entitlements |
| PUT | `/platform/organizations/:id/subscription` | Manual plan assign / extend |
| PUT | `/platform/organizations/:id/entitlements` | Entitlement override |
| PUT | `/platform/organizations/:id/theme` | Assign theme preset |
| GET/PUT | `/platform/organizations/:id/security-policy` | `maxDevicesPerUser` (null = unlimited) |
| GET | `/platform/sessions` | Active sessions across orgs |
| DELETE | `/platform/sessions/:id` | Admin revoke session |
| GET | `/platform/login-history` | Cross-org login history |
| GET/POST | `/platform/device-bans` | List / create bans (`scope`: `user` \| `global`) |
| DELETE | `/platform/device-bans/:id` | Lift ban |

UI: `/platform/organizations`, `/platform/sessions`
