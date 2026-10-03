import type { ITaxFilingRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getTaxFilings(): Promise<ReadonlyArray<ITaxFilingRow>> {
  return serverApiFetch('/tax/filings');
}
