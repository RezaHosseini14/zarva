import { cache } from 'react';
import type { IDashboardInsight, IDashboardOverview } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export const getDashboardOverview = cache(async (): Promise<IDashboardOverview> => {
  return serverApiFetch<IDashboardOverview>('/dashboard/overview');
});

export async function getDashboardInsights(): Promise<ReadonlyArray<IDashboardInsight>> {
  return serverApiFetch('/dashboard/insights');
}
