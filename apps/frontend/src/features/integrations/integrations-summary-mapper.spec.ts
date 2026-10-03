import { describe, expect, it } from 'vitest';

import { integrationsSummaryToKpiItems } from '@/features/integrations/integrations-summary-mapper';

describe('integrationsSummaryToKpiItems', () => {
  it('maps healthy and pending counts from summary', () => {
    const items = integrationsSummaryToKpiItems(
      {
        total: 5,
        healthy: 3,
        degraded: 1,
        offline: 1,
        apiKeys: 2,
        byKind: [],
      },
      { connectedLabel: 'Connected', pendingLabel: 'Pending' },
    );

    expect(items).toEqual([
      {
        id: 'connected',
        label: 'Connected',
        value: '3',
        icon: 'plug-circle-bold',
        accent: 'bg-success/15 text-success ring-success/25',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: '2',
        icon: 'danger-triangle-bold',
        accent: 'bg-warning/15 text-warning ring-warning/25',
        tone: 'warning',
      },
    ]);
  });
});
