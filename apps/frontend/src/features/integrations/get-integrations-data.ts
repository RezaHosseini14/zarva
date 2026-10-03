import type { IIntegrationRow, IIntegrationsSummary, IntegrationKind } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getIntegrations(
  kind?: IntegrationKind,
): Promise<ReadonlyArray<IIntegrationRow>> {
  const suffix = kind ? `?kind=${encodeURIComponent(kind)}` : '';
  return serverApiFetch(`/integrations${suffix}`);
}

export async function getIntegrationsSummary(): Promise<IIntegrationsSummary> {
  return serverApiFetch('/integrations/summary');
}
