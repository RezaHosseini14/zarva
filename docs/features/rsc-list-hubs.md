# RSC list hubs

## Pattern

1. **Page** — async Server Component with `setRequestLocale`; chrome (`PageHeader` / `SubNav`) **outside** Suspense.
2. **Fetch** — `serverApiFetch` (`apps/frontend/src/lib/auth/server-api.ts`) using httpOnly cookies (reads). Mutations stay in `*-actions.ts`.
3. **Section** — async child: fetch via `loadServerApiSection` → map Nest errors to `errorKind` (`auth` | `plan` | `permission` | `server`) → client list island with `chrome="body"`; never silent `catch {}`.
4. **Island** — `'use client'` table/filter receives `rows` props (no Nest token in the browser).
5. **Loading** — `StreamedDomainChrome` (or page chrome) + body Suspense + `DomainListBodySkeleton` / `DomainFormBodySkeleton` / `DomainHubBodySkeleton`. **Do not** use route `loading.tsx` under `(app)` when section Suspense is present (double flash). **Do not** put full `DomainPageSkeleton` inside Suspense.
6. **Mocks** — no hardcoded list rows; empty Nest responses are valid (not errors).
7. **Entitlements** — Trial / Starter / Professional plans include the full nav module set (including `reports`); Enterprise remains `*`.
8. **Cache Components** — not enabled yet; adopt in a dedicated pass.

Reference constant: `apps/frontend/src/lib/lists/rsc-list-pattern.ts`.

## Migrated hubs (API-backed)

| Route | Nest | Section / loader |
| --- | --- | --- |
| `/sales` | `GET /sales/invoices` | `SalesInvoicesSection` |
| `/sales/returns` | `GET /sales/returns` | `SalesReturnsSection` |
| `/sales/payments` | `GET /sales/payments` | `SalesPaymentsSection` |
| `/sales/new` | `GET /inventory` (POS products) | `SalesPosSection` |
| `/customers` | `GET /sales/customers` | `CustomersListSection` |
| `/purchases` | `GET /purchases` | RSC page + catalog fetch |
| `/purchases/returns` | `GET /purchases/returns` | `PurchasesReturnsSection` |
| `/purchases/new` | `POST /purchases` | `createPurchaseAction` |
| `/inventory/products` | `GET /inventory` | catalog fetch |
| `/inventory/movements` | `GET /inventory/movements` | `InventorySectionLoader` |
| `/inventory/warehouses` | `GET /inventory/warehouses` | `InventorySectionLoader` |
| `/inventory/low-stock` | `GET /inventory/low-stock` | `InventorySectionLoader` |
| `/inventory/valuation` | `GET /inventory/valuation` | `InventorySectionLoader` |
| `/inventory/adjustments` | `GET /inventory/movements` (ADJUST) | `InventorySectionLoader` |
| `/inventory/barcodes` | `GET /inventory/barcodes/:code` | `InventorySectionLoader` + `?code=` |
| `/accounting` | `GET /accounting/summary` | `AccountingHubSection` |
| `/accounting/*` sections | `GET /accounting/sections/:section` | `AccountingSectionLoader` |
| `/accounting/rial-ledger` | `GET /accounting/ledger` | `AccountingSectionLoader` (ledger) |
| `/gold` | `GET /gold/transactions` | `GoldOverviewPage` |
| `/gold/*` stubs | `GET /gold/...` | `GoldSectionLoader` |
| `/gold/calculator` | `POST /gold/calculator` | `calculateGoldAction` |
| `/workshop` | `GET /workshop/orders` | workshop page |
| `/workshop/artisans` | `GET /workshop/artisans` | `WorkshopArtisansSection` |
| `/workshop/production` | `GET /workshop/production` | `WorkshopProductionSection` |
| `/organization/profile` | `GET/PUT /organization` | `OrganizationSectionLoader` |
| `/organization/users` | `GET /organization/users` | `OrganizationSectionLoader` |
| `/organization/audit` | `GET /organization/audit` | `OrganizationSectionLoader` |
| `/settings/:section` | `GET/PUT /settings/:section` | `SettingsSectionLoader` |
| `/reports/:kind` | `GET /reports/:kind` | `renderReportKindPage` + `ReportBodySection` |
| `/search` | `GET /search?q=` | `SearchSectionLoader` |
| `/integrations` | `GET /integrations/summary` | `IntegrationsHubSectionLoader` |
| `/integrations/*` | `GET /integrations?kind=` | `IntegrationsSectionLoader` |
| `/branches` | `GET /branches` | `BranchesSectionLoader` |
| `/commerce` | `GET /commerce/channels` | `CommerceSectionLoader` |
| `/tax` | `GET /tax/filings` | `TaxSectionLoader` |
| `/jewelry` | `GET /jewelry` | `JewelrySectionLoader` |
| `/ai` | `GET /ai/insights` | `AiSectionLoader` |
| `/dashboard` | `GET /dashboard/overview` | phase 3 |
| `/roles` | `GET /roles` | phase 4 |
| `/settings/billing` | `GET /billing/subscription` | phase 4 |
| `/pricing` | `GET /plans` (public) | phase 4 |
| `/forgot` `/reset` `/twofa` `/invite` | `POST /auth/forgot-password` etc. | `AuthExtraPage` + actions |

## Still mock / client

None of the former shell hubs remain. Notifications inbox remains API + WebSocket (not mock rows).
