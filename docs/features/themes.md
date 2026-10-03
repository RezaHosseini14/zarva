# Themes

Ten named CSS packs via `html[data-theme]`:

`zarva-gold`, `zarva-noir`, `zarva-emerald`, `zarva-sapphire`, `zarva-rose`, `zarva-copper`, `zarva-pearl`, `zarva-obsidian`, `zarva-amber`, `zarva-slate`

- Stored on `Organization.themePreset` (+ optional `themeTokens`)
- Applied from cookie `zarva_theme` (SSR) + `/theme` after login
- Tenant can change preset only with entitlement `theme.custom` (or platform admin)
- Platform admin assigns any preset from `/platform/organizations`
