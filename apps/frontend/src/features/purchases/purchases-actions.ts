'use server';

import type { IPurchaseReturnRow, IPurchaseRow } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type PurchaseActionResult =
  | { readonly ok: true; readonly purchase: IPurchaseRow }
  | { readonly ok: false; readonly error: string };

export type PurchaseReturnActionResult =
  | { readonly ok: true; readonly row: IPurchaseReturnRow }
  | { readonly ok: false; readonly error: string };

export async function createPurchaseAction(input: {
  readonly supplierId: string;
  readonly number: string;
  readonly displayDate: string;
  readonly goldWeightGrams: number;
  readonly amountLabel: string;
  readonly purity?: string;
  readonly purityKarat?: number;
  readonly rateIrt?: number;
  readonly amountIrt?: number;
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

export async function createPurchaseReturnAction(input: {
  readonly purchaseId: string;
  readonly number: string;
  readonly displayDate: string;
  readonly amountLabel: string;
  readonly grams?: number;
  readonly purityKarat?: number;
}): Promise<PurchaseReturnActionResult> {
  try {
    const row = await serverApiFetch<IPurchaseReturnRow>('/purchases/returns', {
      method: 'POST',
      body: input,
    });
    return { ok: true, row };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Return failed' };
  }
}
