'use server';

import type {
  ICorrectGoldRateRequest,
  IGoldCalculatorResult,
  IGoldLockedRate,
  ILockGoldRateRequest,
} from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';
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

export type GoldRateActionResult =
  | { readonly ok: true; readonly rate: IGoldLockedRate }
  | { readonly ok: false; readonly error: string };

export async function lockGoldRateAction(
  input: ILockGoldRateRequest,
): Promise<GoldRateActionResult> {
  try {
    const rate = await serverApiFetch<IGoldLockedRate>('/gold/rates/lock', {
      method: 'POST',
      body: input,
    });
    return { ok: true, rate };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Rate lock failed' };
  }
}

export async function correctGoldRateAction(
  input: ICorrectGoldRateRequest,
): Promise<GoldRateActionResult> {
  try {
    const rate = await serverApiFetch<IGoldLockedRate>('/gold/rates/correct', {
      method: 'POST',
      body: input,
    });
    return { ok: true, rate };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Rate correction failed' };
  }
}

export async function getTodayGoldRateAction(
  date?: string,
): Promise<IGoldLockedRate | null> {
  try {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return await serverApiFetch<IGoldLockedRate | null>(`/gold/rates/today${q}`);
  } catch {
    return null;
  }
}
