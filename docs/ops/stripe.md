# Stripe ops

Set `BILLING_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and Stripe Price IDs on `PlanPrice.stripePriceId`.

Webhook endpoint: `POST /api/v1/billing/webhooks/stripe` (raw body + `stripe-signature`).

Handled events: `checkout.session.completed`, `customer.subscription.updated|deleted`, `invoice.paid|payment_failed`.
