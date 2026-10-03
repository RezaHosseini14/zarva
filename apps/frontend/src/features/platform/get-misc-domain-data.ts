import type { IOrgSettingSection, IReportDto, ISearchResult, IIntegrationRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getSettingsSection(section: string): Promise<IOrgSettingSection> {
  return serverApiFetch(`/settings/${section}`);
}

export async function getReport(
  kind: 'sales' | 'purchases' | 'inventory' | 'gold' | 'profit',
): Promise<IReportDto> {
  return serverApiFetch(`/reports/${kind}`);
}

export async function searchGlobal(q: string): Promise<ISearchResult> {
  const qs = new URLSearchParams({ q });
  return serverApiFetch(`/search?${qs.toString()}`);
}

export async function getIntegrations(
  kind?: 'device' | 'scale' | 'api' | 'webhook',
): Promise<ReadonlyArray<IIntegrationRow>> {
  const qs = kind ? `?kind=${kind}` : '';
  return serverApiFetch(`/integrations${qs}`);
}
