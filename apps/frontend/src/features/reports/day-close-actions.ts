'use server';

import type { IDayCloseSummary } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export async function getDayCloseAction(
  date?: string,
): Promise<IDayCloseSummary | null> {
  try {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return await serverApiFetch<IDayCloseSummary>(`/reports/day-close${q}`);
  } catch {
    return null;
  }
}

export type DayCloseSignOffResult =
  | { readonly ok: true; readonly summary: IDayCloseSummary }
  | { readonly ok: false; readonly error: string };

export async function signOffDayCloseAction(
  date?: string,
): Promise<DayCloseSignOffResult> {
  try {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    const summary = await serverApiFetch<IDayCloseSummary>(
      `/reports/day-close${q}`,
      { method: 'POST' },
    );
    return { ok: true, summary };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Day-close sign-off failed' };
  }
}

export async function reopenDayCloseAction(
  date: string | undefined,
  reason: string,
): Promise<DayCloseSignOffResult> {
  try {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    const summary = await serverApiFetch<IDayCloseSummary>(
      `/reports/day-close/reopen${q}`,
      { method: 'POST', body: { reason } },
    );
    return { ok: true, summary };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Day-close reopen failed' };
  }
}
