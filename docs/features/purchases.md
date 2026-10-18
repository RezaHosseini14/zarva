# purchases

Supplier purchases with receive-into-ledger on create. UI route: `/purchases`.

## List KPIs

- `GET /purchases/summary` — monthAmountIrt, openCount, totalWeightGrams
- `GET /suppliers/summary` — count, openPayablesIrt, lifetimePurchasesIrt
- `POST /suppliers` / `PATCH /suppliers/:id` — supplier CRUD

## Money-path behavior

- `POST /purchases` creates the purchase and posts **in** to the karat ledger (`GoldLedgerService.postPurchaseIn`). Day must be open.
- Optional `purityKarat`, `rateIrt`, `amountIrt` on create.
- `POST /purchases/returns` — optional `grams` + `purityKarat` for **partial** reverse; omit grams for full reverse. Day must be open.
