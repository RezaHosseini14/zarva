import type { IPurchaseReturnRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getPurchaseReturns(): Promise<ReadonlyArray<IPurchaseReturnRow>> {
  return serverApiFetch('/purchases/returns');
}
