'use server';

import type { IGoldCalculatorResult } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { postGoldCalculator } from '@/features/gold/get-gold-data';

export type GoldCalculatorActionResult =
  | { readonly ok: true; readonly result: IGoldCalculatorResult }
  | { readonly ok: false; readonly error: string };

export async function calculateGoldAction(input: {
  readonly weight: number;
  readonly purity: number;
  readonly rate: number;
  readonly fee?: number;
}): Promise<GoldCalculatorActionResult> {
  try {
    const result = await postGoldCalculator(input);
    return { ok: true, result };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Calculator failed' };
  }
}
