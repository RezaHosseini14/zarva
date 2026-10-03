# ZARVA

Gold Business OS — multi-tenant SaaS (public site + admin dashboard + billing).

**Stack:** Next.js, NestJS 12, Prisma, PostgreSQL, Redis, TanStack Query, MinIO, CASL, Stripe/mock billing.

**Rules:** `.cursor/rules/core.mdc` (always). Load on demand: `typescript`, `i18n`, `responsive`, `authentication`, `authorization`, `billing`, `tables`, `status-chip` (table/detail status chips — `StatusBadge` + icon), `dialogs`, `dashboard-page-header` (Sales/Purchases `DomainListPage` + `PageHeader` pattern), `progressive-loading` (any `(app)` page / async section — law + [`docs/frontend/progressive-loading.md`](docs/frontend/progressive-loading.md); canonical: dashboard), `components`, `api-swagger`, `security`, `icons`, `surfaces` (any UI box/table/glass — **Metric & content boxes** law: `KpiGrid` / `DashboardPanel` / nested footer rail; no custom KPI tiles).

**Frontend skills:** start with `zarva-frontend`; also `shadcn`, `tanstack-query`, `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions`, Next cache skills, `frontend-design`, `web-design-guidelines`, `zarva-responsive`, `zarva-dashboard`.

**Backend skills:** start with `zarva-backend`; also `nestjs-best-practices`, `nestjs-expert`, `zarva-auth`, `zarva-billing`, `zarva-api-swagger`.

**Cross-cutting:** `zarva-typescript`, `zarva-docs`, `zarva-testing`, `gold-domain`, `testing-expert`, `security-expert`.

**Founder skills (Emotix pack):** Full upstream tree at `.agents/claude-skills-founder/`; Cursor setup in `.agents/claude-skills-founder-CURSOR.md`. After submodule update, run `powershell -File scripts/sync-founder-skills.ps1`. Invoke by skill name (`validate-idea`, `product-brief`, `competitor-matrix`, `persona-gen`, `user-interviews`, `mvp-scope`, `pricing-strategy`, `go-to-market`, `landing-page`, `email-sequence`, `metrics-dashboard`, `pitch-deck`, `fundraise-prep`); follow each skill’s `SKILL.md` exactly. Typical chain: validate-idea → brief/persona/interviews → competitor-matrix → mvp/pricing → gtm/landing/email → metrics → pitch/fundraise. Outputs go to `founder/` at repo root.

**Behavior:** Minimal tokens. Smallest diff. Feature-first. No hardcoded UI copy (fa/en/ar). Components ≤100 lines. Mobile-first all Tailwind breakpoints. `I*`-prefixed interfaces; no `any`. After frontend changes: `typecheck` + `lint` (+ `build` if routes/UI) must stay clean — see `.cursor/rules/zero-nextjs-issues.mdc`.

**Graphify:** Install once (`uv tool install graphifyy`). Build/rebuild the monorepo graph with `npm run graphify` (or `graphify extract . --code-only`). After code edits, `npm run graphify:update` / `graphify update .`. Query with `graphify query|path|explain`. Cursor rule: `.cursor/rules/graphify.mdc`; skill: `.agents/skills/graphify`.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `DESIGN.md` for direction, then the antislop core and the skill for the task:
- UI / visual: antislop-ui skill
- Copy & text: antislop-copywriting skill
- People: antislop-human skill
- Mobile / responsive: antislop-layoutmobile skill
- Code comments: antislop-code skill
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
