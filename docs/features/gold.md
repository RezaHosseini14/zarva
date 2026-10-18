# gold

P1 karat ledger and daily rate lock for ZARVA Gold Business OS. UI route: `/gold`. Permissions seeded for entitlement gating.

## Money-path APIs

- `GET /gold/summary` — stock grams, txn count, whether today’s rate is locked (list KPIs)
- `GET /gold/ledger` — chronological metal ledger with running org balance (grams)
- `GET /gold/rates/today` — locked rate for a business date (null if unlocked)
- `POST /gold/rates/lock` — lock buy/sell IRT rates for a date (once; day must be open)
- `POST /gold/rates/correct` — correct locked rates with audited reason (`GoldRateCorrection`)
- `POST /gold/transactions` — audited stock **adjust** (`grams`, `purityKarat`, `direction`, `reason`); day must be open
- `POST /gold/lots` — receive a lot (`grams` + karat) and post purchase-in/adjust to the ledger
- `GET /gold/balance` — org stock by karat (numeric grams)

`GoldLedgerService` posts with `SELECT … FOR UPDATE` on balances, uses original `displayDate` on reversals, and supports `reverseBySourcePartial` for partial returns. Business dates are Asia/Tehran. FE `/gold/ledger` uses gold ledger API (not accounting ledger).
