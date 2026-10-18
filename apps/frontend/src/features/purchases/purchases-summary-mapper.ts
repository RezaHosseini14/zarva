import type { IPurchasesSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { formatSummaryNumber } from '@/lib/format-summary';

export function purchasesSummaryToKpiItems(
  summary: IPurchasesSummary,
  labels: {
    readonly month: string;
    readonly weight: string;
    readonly open: string;
  },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'month',
      label: labels.month,
      value: formatSummaryNumber(summary.monthAmountIrt),
      icon: 'delivery-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'weight',
      label: labels.weight,
      value: formatSummaryNumber(summary.totalWeightGrams, 3),
      icon: 'scale-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
    {
      id: 'open',
      label: labels.open,
      value: formatSummaryNumber(summary.openCount),
      tone: 'warning',
      icon: 'danger-triangle-bold',
      accent: 'bg-warning/15 text-warning ring-warning/25',
    },
  ];
}
