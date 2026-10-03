import type { ILiveRatesResponse } from '@zarva/shared';

const UNAVAILABLE = {
  price: 0,
  changeAmount: 0,
  changePercent: 0,
  tickTrend: 'flat' as const,
  dayTrend: 'flat' as const,
  updatedAt: new Date(0).toISOString(),
  status: 'unavailable' as const,
};

export const EMPTY_LIVE_RATES: ILiveRatesResponse = {
  polledAt: new Date(0).toISOString(),
  rates: [
    { id: 'xau_usd', currency: 'USD', unit: 'oz', ...UNAVAILABLE },
    { id: 'iran_gold_24k', currency: 'IRT', unit: 'gram', ...UNAVAILABLE },
    { id: 'iran_gold_18k', currency: 'IRT', unit: 'gram', ...UNAVAILABLE },
    { id: 'usd_irr', currency: 'IRT', unit: 'usd', ...UNAVAILABLE },
  ],
};
