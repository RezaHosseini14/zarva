import type { ITaxFilingRow, ITaxSummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export interface ITaxCapabilities {
  readonly submitConfigured: boolean;
}

export async function getTaxFilings(): Promise<ReadonlyArray<ITaxFilingRow>> {
  return serverApiFetch('/tax/filings');
}

export async function getTaxCapabilities(): Promise<ITaxCapabilities> {
  return serverApiFetch('/tax/capabilities');
}

export async function getTaxSummary(): Promise<ITaxSummary> {
  return serverApiFetch('/tax/summary');
}
