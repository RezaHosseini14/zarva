import type { IWorkshopSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';
import { ACCENT } from '@/lib/lists/skeleton-kpi';

export function workshopProductionSummaryToKpiItems(
  summary: IWorkshopSummary,
  labels: { readonly batchesLabel: string; readonly ordersLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'batches',
      label: labels.batchesLabel,
      value: String(summary.batches),
      icon: 'chart-bold',
      accent: ACCENT.primary,
    },
    {
      id: 'orders',
      label: labels.ordersLabel,
      value: String(summary.orders),
      icon: 'clipboard-list-bold',
      accent: ACCENT.info,
    },
  ];
}

export function workshopArtisansSummaryToKpiItems(
  summary: IWorkshopSummary,
  labels: { readonly artisansLabel: string; readonly openOrdersLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'artisans',
      label: labels.artisansLabel,
      value: String(summary.artisans),
      icon: 'chart-bold',
      accent: ACCENT.primary,
    },
    {
      id: 'open',
      label: labels.openOrdersLabel,
      value: String(summary.openOrders),
      icon: 'settings-minimalistic-bold',
      accent: ACCENT.info,
    },
  ];
}
