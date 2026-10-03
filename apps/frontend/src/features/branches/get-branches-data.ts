import type { IBranchRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getBranches(): Promise<ReadonlyArray<IBranchRow>> {
  return serverApiFetch('/branches');
}
