import type { IGoldSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { formatSummaryNumber } from '@/lib/format-summary';

export function goldSummaryToKpiItems(
  summary: IGoldSummary,
  labels: {
    readonly stock: string;
    readonly txns: string;
    readonly rateLocked: string;
    readonly rateOpen: string;
  },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'stock',
      label: labels.stock,
      value: formatSummaryNumber(summary.stockGrams, 3),
      tone: 'gold',
      icon: 'crown-star-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'txns',
      label: labels.txns,
      value: formatSummaryNumber(summary.txnCount),
      icon: 'document-text-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
    {
      id: 'rate',
      label: summary.lockedRateToday ? labels.rateLocked : labels.rateOpen,
      value: summary.lockedRateToday ? '1' : '0',
      tone: summary.lockedRateToday ? 'success' : 'warning',
      icon: 'chart-bold',
      accent: summary.lockedRateToday
        ? 'bg-success/15 text-success ring-success/25'
        : 'bg-warning/15 text-warning ring-warning/25',
    },
  ];
}
