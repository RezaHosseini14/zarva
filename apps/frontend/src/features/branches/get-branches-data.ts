import type { IBranchRow, IBranchesSummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getBranches(): Promise<ReadonlyArray<IBranchRow>> {
  return serverApiFetch('/branches');
}

export async function getBranchesSummary(): Promise<IBranchesSummary> {
  return serverApiFetch('/branches/summary');
}
