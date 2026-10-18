# Tax

Period-based filings with file export. Live government submit is adapter-gated.

- Periods: create/list/close
- `POST /tax/filings/generate` aggregates sale invoice amounts in period
- `POST /tax/filings/:id/export` → XML/CSV (`ITaxExportAdapter`)
- `GET /tax/summary` — periods/filings counts + `adapterConfigured`
- `POST /tax/filings/:id/submit` → **503** unless `TAX_AUTHORITY_ADAPTER=live` and `TAX_AUTHORITY_API_KEY` are set; live protocol itself is not fabricated (no fake receipt IDs)
- Settings `/settings/tax` remains org prefs only
- UI: `/tax`
