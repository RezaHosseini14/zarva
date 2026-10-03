'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import type { ILiveRate, LiveRateId, LiveRateTrend } from '@zarva/shared';

import { LiveRateCard } from './live-rate-card';
import { trendFromPrices } from './live-rate-format';

interface ILiveRatesStripProps {
  readonly rates: ReadonlyArray<ILiveRate>;
}

const RATE_ORDER: ReadonlyArray<LiveRateId> = [
  'xau_usd',
  'iran_gold_24k',
  'iran_gold_18k',
  'usd_irr',
];

export function LiveRatesStrip({ rates }: ILiveRatesStripProps) {
  const locale = useLocale();
  const prevPrices = useRef<Partial<Record<LiveRateId, number>>>({});
  const [flash, setFlash] = useState<Partial<Record<LiveRateId, LiveRateTrend>>>(
    {},
  );

  useEffect(() => {
    const nextFlash: Partial<Record<LiveRateId, LiveRateTrend>> = {};
    for (const rate of rates) {
      const prev = prevPrices.current[rate.id];
      if (
        prev !== undefined &&
        prev !== rate.price &&
        rate.status !== 'unavailable'
      ) {
        nextFlash[rate.id] =
          rate.tickTrend !== 'flat'
            ? rate.tickTrend
            : trendFromPrices(prev, rate.price);
      }
      if (rate.status !== 'unavailable') {
        prevPrices.current[rate.id] = rate.price;
      }
    }
    if (Object.keys(nextFlash).length === 0) return;

    let clearTimer = 0;
    const frame = window.requestAnimationFrame(() => {
      setFlash(nextFlash);
      clearTimer = window.setTimeout(() => setFlash({}), 750);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (clearTimer) window.clearTimeout(clearTimer);
    };
  }, [rates]);

  const byId = new Map(rates.map((r) => [r.id, r]));

  return (
    <section className="mb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RATE_ORDER.map((id) => {
          const rate = byId.get(id);
          if (!rate) return null;
          return (
            <LiveRateCard
              key={id}
              rate={rate}
              locale={locale}
              flashTrend={flash[id]}
            />
          );
        })}
      </div>
    </section>
  );
}
