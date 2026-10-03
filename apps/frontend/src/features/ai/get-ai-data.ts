import type { IAiInsightRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getAiInsights(): Promise<ReadonlyArray<IAiInsightRow>> {
  return serverApiFetch('/ai/insights');
}
