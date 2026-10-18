# sales

Gold sale and old-gold buy-back API with customer SMS on status/payment transitions. See [sms.md](./sms.md) and [gold.md](./gold.md).

UI route: `/sales` (list/detail/print) and `/sales/new` (POS). Permissions seeded for entitlement gating.

## List KPIs

- `GET /sales/summary` — todayAmountIrt, invoiceCount, unpaidCount, avgAmountIrt
- `GET /sales/customers/summary` — count, openReceivablesIrt, lifetimeSalesIrt
- Invoice shop fields come from org settings (`business` / `invoices`), not hardcoded branding

## Money-path behavior

- `POST /sales/checkout` — **atomic** POS path: forced locked rate on lines, ledger post, and 1..N payments in one transaction. Supports `clientRequestId` idempotency. Prefer this over create+pay for POS.
- `POST /sales/invoices` accepts `documentKind` (`sale` | `buyback`), numeric `lines` (wage/profit/tax/discount), and `confirm`.
- Confirm / checkout require a locked daily rate and an **open** business day (not signed off).
- Confirmed rates on lines are **server-forced** from the locked buy/sell rate (client `rateIrt` ignored on confirm).
- Confirmed sales post **out** to the karat ledger; buy-backs post **in**. Void and sale returns reverse ledger posts.
- `POST /sales/payments` records numeric `amountIrt` (day must be open). Patching payment status to `paid` without covering `SalePayment` rows is rejected.
- Business dates use **Asia/Tehran** calendar days (`businessDateKey`).
