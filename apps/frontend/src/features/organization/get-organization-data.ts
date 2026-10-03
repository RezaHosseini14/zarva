import type { IAuditRow, IOrgProfile, IOrgUserRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getOrganizationProfile(): Promise<IOrgProfile> {
  return serverApiFetch('/organization');
}

export async function getOrganizationUsers(): Promise<ReadonlyArray<IOrgUserRow>> {
  return serverApiFetch('/organization/users');
}

export async function getOrganizationAudit(): Promise<ReadonlyArray<IAuditRow>> {
  return serverApiFetch('/organization/audit');
}
