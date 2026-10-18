# inventory

P1 module for ZARVA Gold Business OS. UI route: `/inventory`. Permissions seeded for entitlement gating.

## Summary & valuation

- `GET /inventory/summary` — skuCount, lowStockCount, totalValueIrt, totalWeightGrams
- `GET /inventory/valuation` — gold/raw lines valued as fine grams × locked buy rate when available; otherwise parsed `valueLabel`
