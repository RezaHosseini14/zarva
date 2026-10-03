import type { ILiveRate, LiveRateId, LiveRateTrend } from '@zarva/shared';

export interface IRawQuote {
  readonly id: LiveRateId;
  readonly price: number;
  readonly currency: ILiveRate['currency'];
  readonly unit: ILiveRate['unit'];
  readonly dayChangeAmount: number;
  readonly dayChangePercent: number;
  readonly updatedAt: string;
}

export interface ICachedRate {
  readonly quote: IRawQuote;
  readonly previousPrice: number | null;
  readonly tickTrend: LiveRateTrend;
  readonly fetchedAt: string;
}

export function trendFromDelta(delta: number): LiveRateTrend {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}
