# antislop Delivery Gate — ZARVA UI polish

Mode: DURING · Date: 2026-09-24 · Direction: DESIGN.md (zarva-gold)

## 1. Hard Gate

| Check | Result |
|-------|--------|
| No blue/purple decorative canvas | PASS — gold-only radials |
| No Inter/Geist/system as brand font | PASS — Yekan Bakh |
| No hardcoded English in ModuleShell defaults | PASS — i18n shell keys |
| No fake sparkle / beta / terminal hero | PASS |
| Glass dose ≤2 shell surfaces | PASS — sidebar + header only; content uses zarva-panel |

## 2. Purpose

| Technique | Purpose |
|-----------|---------|
| zarva-brand-mark gold square | Brand first in shell / auth / landing |
| Solid zarva-panel | Content hierarchy without frosted flattening |
| Gold focus ring | Keyboard affordance (human) |
| Featured pricing card ring | One plan hierarchy, not uniform card grid |
| POS scan autofocus + dense table | Working floor tool, not wireframe |

## 3. Liveliness

| Dial | Target | Applied |
|------|--------|---------|
| ENERGY | 2 | Warm gold accent on brand, active nav, numbers |
| RHYTHM | 2 | Shell ≠ panels ≠ tables; landing single-job viewport |
| MOTION | 2 | Sidebar slide + focus/hover only |

## 4. Consistency

| Surface | Status |
|---------|--------|
| DESIGN.md + AGENTS pointer | Done |
| globals tokens / buttons / focus | Done |
| AppShell / sidebar / header | Done |
| Landing / auth / pricing | Done |
| Dashboard home widgets | Done |
| POS | Done |
| ModuleShell + page primitives | Done (stubs inherit empty state) |

**Verdict: PASS** for this polish pass.

Remaining debt (out of scope): full ar.json sales string localization leftovers; per-module feature UIs still mock/stub content.
