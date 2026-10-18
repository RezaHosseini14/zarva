import type { ICustomersSummary, ISuppliersSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { formatSummaryNumber } from '@/lib/format-summary';

export function customersSummaryToKpiItems(
  summary: ICustomersSummary,
  labels: { readonly count: string; readonly balance: string; readonly total: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'count',
      label: labels.count,
      value: formatSummaryNumber(summary.count),
      icon: 'users-group-rounded-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
    {
      id: 'balance',
      label: labels.balance,
      value: formatSummaryNumber(summary.openReceivablesIrt),
      tone: 'warning',
      icon: 'wallet-money-bold',
      accent: 'bg-warning/15 text-warning ring-warning/25',
    },
    {
      id: 'total',
      label: labels.total,
      value: formatSummaryNumber(summary.lifetimeSalesIrt),
      icon: 'hand-money-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
  ];
}

export function suppliersSummaryToKpiItems(
  summary: ISuppliersSummary,
  labels: { readonly count: string; readonly balance: string; readonly total: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'count',
      label: labels.count,
      value: formatSummaryNumber(summary.count),
      icon: 'delivery-bold',
      accent: 'bg-info/15 text-info ring-info/25',
    },
    {
      id: 'balance',
      label: labels.balance,
      value: formatSummaryNumber(summary.openPayablesIrt),
      tone: 'warning',
      icon: 'wallet-money-bold',
      accent: 'bg-warning/15 text-warning ring-warning/25',
    },
    {
      id: 'total',
      label: labels.total,
      value: formatSummaryNumber(summary.lifetimePurchasesIrt),
      icon: 'hand-money-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
  ];
}
