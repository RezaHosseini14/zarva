import type { ICommerceChannelRow, ICommerceSummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getCommerceChannels(): Promise<ReadonlyArray<ICommerceChannelRow>> {
  return serverApiFetch('/commerce/channels');
}

export async function getCommerceSummary(): Promise<ICommerceSummary> {
  return serverApiFetch('/commerce/summary');
}
