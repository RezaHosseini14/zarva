import type { IInventorySummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { formatSummaryNumber } from '@/lib/format-summary';

export function inventorySummaryToKpiItems(
  summary: IInventorySummary,
  labels: {
    readonly skus: string;
    readonly value: string;
    readonly low: string;
    readonly weight: string;
  },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'skus',
      label: labels.skus,
      value: formatSummaryNumber(summary.skuCount),
      icon: 'box-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'value',
      label: labels.value,
      value: formatSummaryNumber(summary.totalValueIrt),
      icon: 'dollar-bold',
      accent: 'bg-success/15 text-success ring-success/25',
    },
    {
      id: 'low',
      label: labels.low,
      value: formatSummaryNumber(summary.lowStockCount),
      tone: 'danger',
      icon: 'danger-triangle-bold',
      accent: 'bg-danger/15 text-danger ring-danger/25',
    },
    {
      id: 'weight',
      label: labels.weight,
      value: formatSummaryNumber(summary.totalWeightGrams, 3),
      icon: 'scale-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
  ];
}
