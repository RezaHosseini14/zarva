# SMS (Kavenegar)

Transactional SMS for OTP auth and gold sale status updates.

## Provider

| Env | Behavior |
| --- | --- |
| `SMS_PROVIDER=console` (default) | Logs messages; OTP fixed `000000` |
| `SMS_PROVIDER=kavenegar` | Live Kavenegar Lookup / Send |

Required for production: `KAVENEGAR_API_KEY`, approved templates in the Kavenegar panel.

## Templates (Lookup)

| Env / default name | Use |
| --- | --- |
| `KAVENEGAR_OTP_TEMPLATE` / `zarva-otp` | Login & signup OTP (`%token` = code) |
| `KAVENEGAR_TEMPLATE_SALE_CONFIRMED` / `zarva-sale-confirmed` | Invoice confirmed |
| `KAVENEGAR_TEMPLATE_SALE_PAYMENT_PARTIAL` | Partial payment |
| `KAVENEGAR_TEMPLATE_SALE_PAYMENT_PAID` | Fully paid |
| `KAVENEGAR_TEMPLATE_SALE_READY` | Ready for pickup |
| `KAVENEGAR_TEMPLATE_SALE_COMPLETED` | Delivered / completed |
| `KAVENEGAR_TEMPLATE_SALE_VOID` | Cancelled |

Sale tokens: `token` = invoice number, `token2` = status/amount/remaining, `token3` = gold weight.

## Sale lifecycle SMS

Recipient is the **customer** phone on the sale invoice (not the dashboard user).

API (authenticated):

- `POST /sales/customers`
- `POST /sales/invoices` (`confirm: true` → confirmed + SMS)
- `PATCH /sales/invoices/:id/status`
- `PATCH /sales/invoices/:id/payment`

Statuses: `draft` → `confirmed` → `ready` → `completed` | `void`.  
Payments: `unpaid` | `partial` | `paid` (SMS on partial/paid after confirm).

## OTP storage

Codes are SHA-256 hashed in Redis (`REDIS_URL`), TTL 2 minutes, cooldown 60s, max 5 requests/hour per phone+purpose. Falls back to in-memory if Redis is down.
