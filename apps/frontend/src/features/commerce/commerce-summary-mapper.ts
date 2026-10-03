import type { ICommerceSummary } from '@zarva/shared';

import type { IKpiItem } from '@/components/page/kpi-grid';

export function commerceSummaryToKpiItems(
  summary: ICommerceSummary,
  labels: { readonly channelsLabel: string; readonly liveLabel: string },
): ReadonlyArray<IKpiItem> {
  return [
    {
      id: 'channels',
      label: labels.channelsLabel,
      value: String(summary.channels),
      icon: 'shop-bold',
      accent: 'bg-primary/15 text-primary ring-primary/25',
    },
    {
      id: 'live',
      label: labels.liveLabel,
      value: String(summary.activeChannels),
      icon: 'plug-circle-bold',
      accent: 'bg-success/15 text-success ring-success/25',
    },
  ];
}
