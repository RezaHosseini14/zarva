# Progressive loading (frontend)

How every `(app)` page loads data without blanking the shell or blocking unrelated sections.

**Cursor rule:** [`.cursor/rules/progressive-loading.mdc`](../../.cursor/rules/progressive-loading.mdc)  
**Canonical code:** [`apps/frontend/src/app/[locale]/(app)/dashboard/page.tsx`](../apps/frontend/src/app/[locale]/(app)/dashboard/page.tsx)

---

## Law

```text
1 independent data source
  = 1 independent loading unit
  = 1 Suspense boundary
  = 1 section skeleton that mirrors that section’s real UI
```

Boundaries follow **data dependencies**, not how many cards sit on screen.

---

## Target shape

```text
AppShellFrame          ← layout — do not skeleton the whole chrome
├── Sidebar
│   ├── Brand / UserMenu           → immediate
│   └── Nav list                   → Suspense + SidebarNavSkeleton (API /navigation)
├── Header
└── main
    └── Page
        ├── Static UI              → immediate (title bridge, SubNav, i18n headers/icons)
        ├── Suspense A             → Skeleton A | async section A (fetch A)
        ├── Suspense B             → Skeleton B | async section B (fetch B)
        └── …
```

Exception: only the **sidebar nav link list** may Suspense-load (permission-filtered from the API). Do not skeleton the entire `AppShellFrame`, header, or brand block.

---

## Dashboard reference (copy this)

| Source | Fetch | Suspense | Skeleton |
|--------|--------|----------|----------|
| A | `fetchLiveMarketRates` | own | `DashboardLiveRatesSkeleton` |
| B | `getDashboardOverview` (`React.cache`) | own | `DashboardOverviewSkeleton` |
| — | AI copy (i18n only) | none | real `AiPanel` via `aiSlot` |

Files:

- Page wires Suspense: `dashboard/page.tsx`
- Skeletons: `features/dashboard/dashboard-skeletons.tsx` + `dashboard-skeleton-bits.tsx`
- Static copy for skeletons: `dashboard-skeleton-copy.ts`
- Overview section accepts `aiSlot` so AI paints during overview load

```tsx
<AppShell title={t('title')}>
  <Suspense fallback={<DashboardLiveRatesSkeleton titles={…} hints={…} />}>
    <DashboardLiveRatesSection />
  </Suspense>
  <Suspense fallback={<DashboardOverviewSkeleton copy={…} aiSlot={ai} />}>
    <DashboardOverviewSection aiSlot={ai} />
  </Suspense>
</AppShell>
```

---

## Skeleton rules

- **Match the live box:** same grid, `min-h`, padding, header vs nested footer rail (see KPI / live-rate cards).
- **Real titles + icons** when they are i18n/static; shimmer **only** data (value, chart body, table rows).
- **`.zarva-shimmer`** — gold wash in `globals.css`. No grey `animate-pulse` blocks.
- **Search / FilterSearch:** skeleton must be **`w-full`** like live `FilterSearch`. Never `max-w-md` (or any narrower cap) on the loading search shell — width must not jump when Suspense resolves.
- Reuse shells: `MetricCardShell` / `DomainListBodySkeleton` / `DomainFormBodySkeleton` / `DomainHubBodySkeleton` when the UI matches; otherwise page-specific skeletons under `features/<name>/`. Full `DomainPageSkeleton` is chrome+body only — never a Suspense fallback.

---

## Forbidden (causes double flash / black main)

| Bad | Why |
|-----|-----|
| `(app)/loading.tsx` or route `loading.tsx` **plus** section Suspense | First flash replaces main, then section skeletons again |
| Fake AppShell inside any skeleton | Duplicates sidebar/header |
| Single `await getEverything()` then one page render | Unrelated sections wait on each other |
| Multiple Suspenses around the **same** cached fetch “for show” | Not independent; use one Suspense |
| Narrow search skeleton (`max-w-md`) that expands after load | Layout jump; use full-width search shell |

When the page has section Suspense: **delete** segment `loading.tsx`. Shell stays; main streams the page.

---

## Shared request

Several boxes, one API → `React.cache` on the loader → **one** Suspense. Skeleton may compose all dependent boxes. They resolve together — correct.

---

## Recipe for a new `(app)` page

1. Map every server fetch / async RSC section.
2. Mark static UI (no await).
3. Group fetches that share one endpoint.
4. For each independent source: async section component + UI-faithful skeleton + `<Suspense>`.
5. Wire Suspense in `page.tsx` (or chrome + body Suspense for lists).
6. Confirm no route `loading.tsx` for that segment.
7. Check `fa` RTL + responsive; `typecheck` / `lint`.

### Domain lists

`StreamedDomainChrome` (sync header/nav) + Suspense children with `DomainListBodySkeleton`.

### Section loaders / hubs

`StreamedDomainChrome` (or equivalent page chrome) + Suspense body + `DomainBodySkeleton` variant (`list` | `form` | `hub`). Section islands use `chrome="body"`. Never put full `DomainPageSkeleton` inside Suspense.

### Client-only TanStack Query

Show pending UI inside the client page. Do not add a segment `loading.tsx` that blanks main first.

---

## Success criteria

- Soft-nav: sidebar/header stay; no blank black main; no pre-section route loading flash
- Static chrome (title, SubNav, CTAs, i18n KPI labels) visible immediately
- Body skeleton matches live KPIs/table/form/hub
- Fast section appears while slow section keeps its own skeleton
- Final UI matches the pre-refactor layout
- No `(app)` route `loading.tsx` competing with section Suspense
