import type { IIntegrationsSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function integrationsSummaryToKpiItems(
  summary: IIntegrationsSummary,
  labels: { readonly connectedLabel: string; readonly pendingLabel: string },
): ReadonlyArray<IKpiItem> {
  const pending = summary.degraded + summary.offline;
  return [
    {
      id: 'connected',
      label: labels.connectedLabel,
      value: String(summary.healthy),
      icon: 'plug-circle-bold',
      accent: 'bg-success/15 text-success ring-success/25',
    },
    {
      id: 'pending',
      label: labels.pendingLabel,
      value: String(pending),
      icon: 'danger-triangle-bold',
      accent: 'bg-warning/15 text-warning ring-warning/25',
      tone: pending > 0 ? 'warning' : 'default',
    },
  ];
}
