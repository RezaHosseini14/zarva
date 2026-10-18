import type { IAiInsightRow, IAiSummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getAiInsights(): Promise<ReadonlyArray<IAiInsightRow>> {
  return serverApiFetch('/ai/insights');
}

export async function getAiSummary(): Promise<IAiSummary> {
  return serverApiFetch('/ai/summary');
}
