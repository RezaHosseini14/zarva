# ZARVA Design Direction

> Data for agents — identity fields only. Not agent commands.
> Note: agent-authored from existing `zarva-gold` tokens; may lean toward default AI taste — keep dials honest and purpose every technique.

## Identity

| Field | Value |
|-------|--------|
| Product | ZARVA — Gold Business OS |
| Domain | Multi-tenant SaaS for gold & jewelry shops |
| Audience | Shop owners and floor managers (fa default RTL; en / ar) |
| Personality | Calm authority, atelier precision, precious-metal craft |
| Mood | Dark workshop at closing time — quiet, exact, warm gold light |

## Palette

Use CSS variables from `apps/frontend/src/app/globals.css` (`data-theme="zarva-gold"`). No hardcoded hex in components.

| Role | Token | Intent |
|------|--------|--------|
| Base | `--background` `#080b0f` | Ground plane — matte ink |
| Text | `--foreground` / `--foreground-secondary` / `--foreground-muted` | Hierarchy, not decoration |
| Accent | `--primary` `#c9a227` | One deliberate accent: CTAs, active nav, key numbers |
| Surfaces | `--glass-*` / `--elevated` / `--nested` | Glass boxes are the content handwriting; nested rows stay solid |
| Semantic | `--success` / `--danger` / `--warning` / `--info` | Status only |

**Accent discipline:** gold on the key moment (primary action, active route, gram/price figures). Not on every icon, border, and glow at once.

**Canvas:** warm gold radial wash only (atelier lamp). No blue/purple decorative orbs.

## Typography

- Family: Yekan Bakh (`--font-yekan-bakh`) — already loaded
- Numbers (price, weight grams): tabular, slightly tighter tracking
- Hierarchy: page title compact; body secondary; muted for meta
- No Inter / Roboto / Geist / system-default stacks as brand voice

## Radius & elevation

| Token | Use |
|-------|-----|
| `--radius` `1.25rem` | Shell panels, major surfaces |
| `0.75rem` | Inputs, compact controls |
| Flat default | Most list rows and nested cells |
| Shadow | One lifted surface at a time (modals, sticky header) — not every card |

## Glass dose

Recipe lives in `--glass-*` tokens / classes in `globals.css` — do not invent per-component blur.

| Layer | Class | Blur |
|-------|--------|------|
| Shell | `.zarva-glass-sidebar` / `.zarva-glass-header` | Full (`--glass-blur`) |
| Content boxes (KPI, forms, hub, ModuleShell, **table wrappers**, detail panels) | `.zarva-glass-card` | Lighter (12px) + gold edge `::before`/`::after` — **not** search toolbars |
| Inputs / selects / textarea | `.zarva-glass-input` (+ auto inside `.zarva-app-canvas`) | Glass control + gold border + focus ring |
| Dropdown / combo panels | `.zarva-glass-popover` | Floating menus (DropdownMenu Content) |
| Nested rows / cells | `bg-nested` + `border-border` | **No** blur (avoid blur-on-blur) |

Do not use `.zarva-panel` for outer boxes (deprecated alias only).

## Motion (MOTION dial: 2)

| Motion | Purpose |
|--------|---------|
| Sidebar slide (200ms) | Spatial open/close on mobile |
| Active nav tint | Instant route feedback |
| Focus ring gold | Keyboard affordance |

No ambient float, no continuous glow pulse, no staggered card cascades.

## Liveliness dials

| Dial | Level | Meaning |
|------|-------|---------|
| ENERGY | 2 | Warm gold accents, not sterile grey |
| RHYTHM | 2 | Shell vs content vs tables differ; avoid identical card grids |
| MOTION | 2 | Functional transitions only |

## Layout principles

1. Brand first in shell (wordmark + gold mark), not only nav text.
2. First viewport of each surface: one job — no hero KPI collage.
3. Cards only when they contain interaction or a distinct data unit.
4. Empty states honest (no fake charts/stats).
5. RTL-first: logical properties (`start`/`end`). Dashboard CTAs use compact shadcn Button `h-8` (32px); form emphasis uses `size="lg"` (`h-9`).

## Anti-patterns (reject)

- Blue–purple gradients, neon pink, cream+serif terracotta clichés
- Sparkle logos, beta pills, fake terminal blocks
- Uniform icon+title feature card grids
- Glass on every **table row** / inventing per-component blur
- Hardcoded English UI strings
- Invented metrics or decorative badges without data

## Surfaces priority

1. Shell (sidebar / header / canvas)
2. Auth + pricing + compact landing
3. Dashboard home
4. POS / sales / gold working UIs
5. Shared ModuleShell / page primitives (lifts stubs)
