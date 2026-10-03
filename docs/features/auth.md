# Auth

JWT access + httpOnly refresh rotation. Signup creates Organization + trial subscription.

## Login modes

1. **Password** — `POST /auth/login` with email + password (+ optional `clientDeviceId`, `revokeSessionId`)
2. **SMS OTP** — `POST /auth/otp/request` `{ phone, purpose: "login" }` then `POST /auth/otp/verify` `{ phone, code, clientDeviceId?, revokeSessionId? }`

Signup requires verified phone: request OTP with `purpose: "signup"`, then `POST /auth/signup` including `phone`, `address`, and `otpCode`.

## Sessions & devices

Each refresh-token family is one logical device (`RefreshSession` + `clientDeviceId` from browser localStorage).

| Endpoint | Purpose |
| --- | --- |
| `GET /auth/sessions` | Active devices |
| `GET /auth/sessions/history` | Own login history (`AuthLoginEvent`) |
| `DELETE /auth/sessions/:id` | Terminate one device |
| `POST /auth/sessions/revoke-others` | Keep current, revoke rest |
| `POST /auth/sessions/:id/deny` | «Not me» on new-login alert |
| `PATCH /auth/sessions/:id` | Optional label |
| `POST /auth/logout` | Revokes **current** family only |

On **new** device login: socket `auth.session.new` + notification `type=auth.new_login`. On revoke: `auth.session.revoked`.

**Org cap (Filimo):** `OrgSetting.security.maxDevicesPerUser`. Over limit → `409` `{ code: "DEVICE_LIMIT", sessions }`. Client picks a session to revoke and retries.

**Device ban:** Super Admin bans by `clientDeviceId` with scope `user` (one account) or `global` (all accounts). Login → `403` `{ code: "DEVICE_BANNED" }`.

UI: `/{locale}/account/devices` (user menu). Platform: `/{locale}/platform/sessions` + max-devices on Organizations panel.

## User profile fields

Every user has required `phone` (unique, `09XXXXXXXXX`) and `address`.

## Seeded users (after `npm run db:seed`)

| Email | Password | Phone | Role | Nav via CASL |
| --- | --- | --- | --- | --- |
| `admin@zarva.dev` | `Password123!` | `09120000001` | `SUPER_ADMIN` | all modules (`manage` `all`) |
| `cashier@zarva.dev` | `Password123!` | `09120000002` | `CASHIER` | dashboard, sales, customers only |

With `SMS_PROVIDER=console`, OTP code is always `000000` (also logged on the server).

Sidebar uses `canAccessSubject()` from `@zarva/shared` — never hide CASL; gate by ability.

When API is offline, the same credentials (or the login page seed buttons) hydrate a local seed session so UI CASL can be reviewed.
