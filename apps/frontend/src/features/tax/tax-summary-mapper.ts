import type { ITaxSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function taxSummaryToKpiItems(
  summary: ITaxSummary,
  labels: { readonly openLabel: string; readonly filedLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'open',
      label: labels.openLabel,
      value: String(summary.openPeriods),
      icon: 'bill-list-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'filed',
      label: labels.filedLabel,
      value: String(summary.submittedFilings),
      icon: 'clipboard-list-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
  ];
}
