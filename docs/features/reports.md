# reports

Aggregated reports plus day-close reconciliation. UI: `/reports`, `/reports/day-close`.

## Aggregates

- Sales / purchases / gold reports include last-7 Tehran-day `series` for charts
- Profit report COGS = fine grams sold × locked buy rate for the sale date (fallback line rate)

## Day close

- `GET /reports/day-close?date=YYYY-MM-DD` — if signed off, returns **frozen** `summaryJson`; otherwise live recompute
- Closing grams = ledger stock **as of** that business date (all txns with `displayDate <= date`, including reversals)
- Metal day nets include reversals on that display date
- `POST /reports/day-close?date=YYYY-MM-DD` — sign-off (persists `DayClose`); blocks further sales/purchases/adjust/rate ops for that date
- `POST /reports/day-close/reopen` — admin reopen with reason (clears freeze until signed off again)
