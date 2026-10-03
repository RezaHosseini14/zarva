---
name: zarva-dashboard
description: Pixel-faithful ZARVA dashboard shell (sidebar, header, KPIs, forecast, activity). Use for dashboard layout and home widgets.
---

# ZARVA Dashboard

Follow `.cursor/rules/dashboard-ui.mdc`, `.cursor/rules/surfaces.mdc` (Metric & content boxes law), and `.cursor/rules/icons.mdc`.

- KPI / panels → `.zarva-glass-card` via `KpiGrid` + `DashboardPanel` (reuse on reports and other hubs)
- Skeletons → `MetricCardShell` / `ForecastChartSkeleton`
- Decompose into ≤100-line components
- Responsive grids: KPI `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`; summary+chart `lg:grid-cols-3`
- Load `zarva-responsive` and `progressive-loading` for section Suspense
