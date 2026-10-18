import type { IAiSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function aiSummaryToKpiItems(
  summary: IAiSummary,
  labels: { readonly insightsLabel: string; readonly criticalLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'insights',
      label: labels.insightsLabel,
      value: String(summary.insights),
      icon: 'chart-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'critical',
      label: labels.criticalLabel,
      value: String(summary.critical),
      icon: 'danger-triangle-bold',
      accent: 'bg-danger/15 text-danger ring-danger/25',
      tone: summary.critical > 0 ? 'danger' : 'default',
    },
  ];
}
