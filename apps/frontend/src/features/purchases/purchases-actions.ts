'use server';

import type { IPurchaseRow } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type PurchaseActionResult =
  | { readonly ok: true; readonly purchase: IPurchaseRow }
  | { readonly ok: false; readonly error: string };

export async function createPurchaseAction(input: {
  readonly supplierId: string;
  readonly number: string;
  readonly displayDate: string;
  readonly goldWeightGrams: number;
  readonly amountLabel: string;
  readonly purity?: string;
  readonly lineDescription?: string;
}): Promise<PurchaseActionResult> {
  try {
    const purchase = await serverApiFetch<IPurchaseRow>('/purchases', {
      method: 'POST',
      body: input,
    });
    return { ok: true, purchase };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Create failed' };
  }
}
