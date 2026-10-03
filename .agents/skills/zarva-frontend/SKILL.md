---
name: zarva-frontend
description: >
  ZARVA frontend stack playbook (Next.js App Router, React 19, TanStack Query,
  shadcn/Radix, Tailwind, next-intl, CASL, Serwist PWA). Use when building or
  refactoring apps/frontend UI, features, forms, tables, dashboard, pricing,
  data fetching, or component APIs. Routes to deeper skills when needed.
---

# ZARVA Frontend

Prefer existing feature patterns over new abstractions.

## Stack (apps/frontend)

- Framework: Next.js App Router (`app/[locale]/...`)
- UI: shadcn/Radix + Tailwind (`components/ui/*`)
- Server state: TanStack Query
- Forms: react-hook-form + zod
- i18n: next-intl + `messages/{en,fa,ar}.json`
- AuthZ: CASL (`@casl/react`)
- Feature layout: `features/<name>/components|hooks|services`
- Components ≤100 lines; mobile-first all Tailwind BPs

## Always load first

1. `.cursor/rules/core.mdc`, `typescript.mdc`, `responsive.mdc`, `i18n.mdc`, `surfaces.mdc` (any box/table/glass)
2. Any `(app)` page / async section / skeleton → `.cursor/rules/progressive-loading.mdc` + `docs/frontend/progressive-loading.md` (canonical: dashboard)
3. Match neighboring feature files
4. Reuse `components/ui/*`; content boxes → `.zarva-glass-card`; inputs/selects → `.zarva-glass-input`; menus → `.zarva-glass-popover`

## Delegate

| Task | Skill |
| --- | --- |
| Perf / RSC | `vercel-react-best-practices` |
| Composition / React 19 | `vercel-composition-patterns` |
| View transitions | `vercel-react-view-transitions` |
| shadcn | `shadcn` |
| Query cache | `tanstack-query` |
| Cache Components | `next-cache-components-adoption` / `optimizer` |
| Partial prefetch | `next-partial-prefetching-adoption` |
| Marketing visuals | `frontend-design` |
| A11y audit | `web-design-guidelines` |
| React API research | `react-expert` |
| Dashboard pixel shell | `zarva-dashboard` |
| Responsive checklist | `zarva-responsive` |

## Anti-patterns

- Hardcoded UI copy; `any`; business logic in pages; desktop-only layouts; parallel UI kits
