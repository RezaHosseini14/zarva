import type { IBranchesSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function branchesSummaryToKpiItems(
  summary: IBranchesSummary,
  labels: { readonly totalLabel: string; readonly activeLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'total',
      label: labels.totalLabel,
      value: String(summary.total),
      icon: 'buildings-2-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'active',
      label: labels.activeLabel,
      value: String(summary.active),
      icon: 'clipboard-list-bold',
      accent: 'bg-success/15 text-success ring-success/25',
    },
  ];
}
