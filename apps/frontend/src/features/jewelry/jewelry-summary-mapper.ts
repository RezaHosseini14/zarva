import type { IJewelrySummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function jewelrySummaryToKpiItems(
  summary: IJewelrySummary,
  labels: { readonly piecesLabel: string; readonly availableLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'pieces',
      label: labels.piecesLabel,
      value: String(summary.pieces),
      icon: 'chart-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'available',
      label: labels.availableLabel,
      value: String(summary.available),
      icon: 'clipboard-list-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
  ];
}
