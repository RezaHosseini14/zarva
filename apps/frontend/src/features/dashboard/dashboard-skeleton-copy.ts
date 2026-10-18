import { getTranslations } from 'next-intl/server';
import type { LiveRateId } from '@zarva/shared';

import type { IDashboardSkeletonCopy } from '@/features/dashboard/dashboard-skeletons';

export async function getDashboardSkeletonCopy(): Promise<{
  readonly copy: IDashboardSkeletonCopy;
  readonly liveRateTitles: Readonly<Record<LiveRateId, string>>;
  readonly liveRateHints: Readonly<Record<LiveRateId, string>>;
}> {
  const t = await getTranslations('dashboard');
  const tl = await getTranslations('dashboard.liveRates');

  const usdOz = `${tl('usd')} · ${tl('perOz')}`;
  const tomanGram = `${tl('toman')} · ${tl('perGram')}`;
  const toman = tl('toman');

  return {
    copy: {
      forecastTitle: t('forecast'),
      activityTitle: t('activity'),
      kpiLabels: {
        salesToday: t('kpi.salesToday'),
        goldStock: t('kpi.goldStock'),
        customers: t('kpi.customers'),
        margin: t('kpi.cashInToday'),
      },
    },
    liveRateTitles: {
      xau_usd: tl('xau_usd'),
      iran_gold_24k: tl('iran_gold_24k'),
      iran_gold_18k: tl('iran_gold_18k'),
      usd_irr: tl('usd_irr'),
    },
    liveRateHints: {
      xau_usd: usdOz,
      iran_gold_24k: tomanGram,
      iran_gold_18k: tomanGram,
      usd_irr: toman,
    },
  };
}
