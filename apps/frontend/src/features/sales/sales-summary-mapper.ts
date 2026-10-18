import type { ISalesSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { formatSummaryNumber } from '@/lib/format-summary';

export function salesSummaryToKpiItems(
  summary: ISalesSummary,
  labels: {
    readonly today: string;
    readonly count: string;
    readonly avg: string;
    readonly unpaid: string;
  },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'today',
      label: labels.today,
      value: formatSummaryNumber(summary.todayAmountIrt),
      icon: 'cart-large-2-bold',
      accent: 'bg-success/15 text-success ring-success/25',
    },
    {
      id: 'count',
      label: labels.count,
      value: formatSummaryNumber(summary.invoiceCount),
      icon: 'document-text-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
    {
      id: 'avg',
      label: labels.avg,
      value: formatSummaryNumber(summary.avgAmountIrt),
      icon: 'chart-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'unpaid',
      label: labels.unpaid,
      value: formatSummaryNumber(summary.unpaidCount),
      tone: 'warning',
      icon: 'danger-triangle-bold',
      accent: 'bg-warning/15 text-warning ring-warning/25',
    },
  ];
}
