# Tax

Period-based filings with file export. Live government submit is adapter-gated.

- Periods: create/list/close
- `POST /tax/filings/generate` aggregates sale invoice amounts in period
- `POST /tax/filings/:id/export` → XML/CSV (`ITaxExportAdapter`)
- `POST /tax/filings/:id/submit` → **501** `TAX_LIVE_SUBMIT_UNAVAILABLE` unless `TAX_AUTHORITY_ADAPTER=live` and credentials are configured (no Iranian authority connector shipped)
- Settings `/settings/tax` remains org prefs only
- UI: `/tax`
