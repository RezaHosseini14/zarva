import { cache } from 'react';
import type { IDashboardOverview } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export const getDashboardOverview = cache(async (): Promise<IDashboardOverview> => {
  return serverApiFetch<IDashboardOverview>('/dashboard/overview');
});
