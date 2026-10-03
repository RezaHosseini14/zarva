import type { ILiveRate, LiveRateTrend } from '@zarva/shared';

export function formatLivePrice(rate: ILiveRate, locale: string): string {
  if (rate.status === 'unavailable') return '—';
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: rate.currency === 'USD' ? 2 : 0,
    minimumFractionDigits: rate.currency === 'USD' ? 2 : 0,
  }).format(rate.price);
}

export function formatLiveDelta(rate: ILiveRate, locale: string): string {
  if (rate.status === 'unavailable') return '';
  const amount = new Intl.NumberFormat(locale, {
    signDisplay: 'exceptZero',
    maximumFractionDigits: rate.currency === 'USD' ? 2 : 0,
  }).format(rate.changeAmount);
  const percent = new Intl.NumberFormat(locale, {
    signDisplay: 'exceptZero',
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(rate.changePercent / 100);
  return `${amount} (${percent})`;
}

export function displayTrend(rate: ILiveRate): LiveRateTrend {
  return rate.tickTrend !== 'flat' ? rate.tickTrend : rate.dayTrend;
}

export function trendFromPrices(prev: number, next: number): LiveRateTrend {
  if (next > prev) return 'up';
  if (next < prev) return 'down';
  return 'flat';
}
