'use client';

import { useTranslations } from 'next-intl';
import type { ILiveRate, LiveRateId, LiveRateTrend } from '@zarva/shared';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useDisplayPreferences } from '@/features/settings/use-display-preferences';
import { LIVE_RATE_META } from './live-rate-meta';
import {
  displayTrend,
  formatLiveDelta,
  formatLivePrice,
} from './live-rate-format';

interface ILiveRateCardProps {
  readonly rate: ILiveRate;
  readonly locale: string;
  readonly flashTrend?: LiveRateTrend;
}

export function LiveRateCard({ rate, locale, flashTrend }: ILiveRateCardProps) {
  const t = useTranslations('dashboard.liveRates');
  const { compactUnits } = useDisplayPreferences();
  const trend = displayTrend(rate);
  const meta = LIVE_RATE_META[rate.id];
  const unitLabel =
    rate.unit === 'oz'
      ? compactUnits
        ? t('perOzCompact')
        : t('perOz')
      : rate.unit === 'gram'
        ? compactUnits
          ? t('perGramCompact')
          : t('perGram')
        : '';
  const currencyLabel = rate.currency === 'USD' ? t('usd') : t('toman');
  const flashClass =
    flashTrend === 'up'
      ? 'zarva-tick-flash-up'
      : flashTrend === 'down'
        ? 'zarva-tick-flash-down'
        : '';
  const isUnavailable = rate.status === 'unavailable';

  return (
    <article className="zarva-glass-card zarva-metric-card">
      <div className="zarva-metric-card__header">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
              meta.accent,
            )}
          >
            <Icon name={meta.icon} className="text-lg" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-none tracking-tight text-foreground">
              {t(rate.id as LiveRateId)}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold leading-none text-secondary">
              {currencyLabel}
              {unitLabel ? ` · ${unitLabel}` : ''}
            </p>
          </div>
        </div>
        {isUnavailable ? (
          <span className="shrink-0 rounded-md bg-nested px-2 py-1 text-[11px] text-muted-fg">
            {t('unavailable')}
          </span>
        ) : rate.status === 'stale' ? (
          <span className="shrink-0 rounded-md bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning">
            {t('stale')}
          </span>
        ) : null}
      </div>

      <div className="zarva-metric-card__footer">
        <div className="zarva-metric-card__footer-row">
          <p
            className={cn(
              'zarva-num min-w-0 truncate text-[1.65rem] font-semibold leading-none tracking-tight text-primary',
              flashClass,
              isUnavailable && 'text-muted-fg',
            )}
          >
            {formatLivePrice(rate, locale)}
          </p>

          {!isUnavailable ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                trend === 'up' && 'bg-success/12 text-success',
                trend === 'down' && 'bg-danger/12 text-danger',
                trend === 'flat' && 'bg-background/40 text-secondary',
              )}
              aria-label={t(trend)}
            >
              {trend === 'up' ? (
                <Icon name="alt-arrow-up-bold" className="text-sm" />
              ) : trend === 'down' ? (
                <Icon name="alt-arrow-down-bold" className="text-sm" />
              ) : null}
              <span className="zarva-num">{formatLiveDelta(rate, locale)}</span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
