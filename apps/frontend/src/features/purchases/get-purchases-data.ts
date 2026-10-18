import type { IPurchaseReturnRow, IPurchaseRow, IPurchasesSummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getPurchasesSummary(): Promise<IPurchasesSummary> {
  return serverApiFetch('/purchases/summary');
}

export async function getPurchases(): Promise<ReadonlyArray<IPurchaseRow>> {
  return serverApiFetch('/purchases');
}

export async function getPurchaseReturns(): Promise<ReadonlyArray<IPurchaseReturnRow>> {
  return serverApiFetch('/purchases/returns');
}
