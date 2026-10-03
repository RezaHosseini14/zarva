# Billing

Plans: trial / starter / professional / enterprise. `BILLING_PROVIDER=mock|stripe`.

## Lifecycle

- One subscription per Organization (`source`: `stripe` | `manual`)
- Stripe Checkout + Portal; webhooks verify `STRIPE_WEBHOOK_SECRET` and sync status / period / invoices
- Superadmin / Platform admin: `PUT /platform/organizations/:id/subscription` for manual assign
- Entitlements: plan JSON ⊕ latest `EntitlementOverride`; `assertModule` gates modules
- Daily cron (`SubscriptionLifecycleService`): expire ended subs; warn ORG_ADMINs 7 days before (`SUBSCRIPTION_EXPIRY_WARN_DAYS`) via in-app notification + email (`RESEND_API_KEY` or SMTP stub / console)

## Env

- `BILLING_PROVIDER=mock|stripe`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`
- `SUBSCRIPTION_EXPIRY_WARN_DAYS=7`
