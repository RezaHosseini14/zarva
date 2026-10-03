'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import type { ILiveRate, ILiveRatesResponse, LiveRateId } from '@zarva/shared';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { EMPTY_LIVE_RATES } from '@/features/dashboard/empty-live-rates';
import {
  displayTrend,
  formatLiveDelta,
  formatLivePrice,
} from '@/features/dashboard/live-rate-format';
import { LIVE_RATE_META } from '@/features/dashboard/live-rate-meta';
import { useAuth } from '@/features/auth/auth-provider';
import { ErrorState } from '@/components/page/error-state';
import { HeaderActionTooltip } from './header-action-tooltip';

const RATE_ORDER: ReadonlyArray<LiveRateId> = [
  'xau_usd',
  'iran_gold_24k',
  'iran_gold_18k',
  'usd_irr',
];

async function fetchLiveRates(): Promise<ILiveRatesResponse> {
  const res = await fetch('/api/markets/live', {
    cache: 'no-store',
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) {
    throw new Error(`markets ${res.status}`);
  }
  return (await res.json()) as ILiveRatesResponse;
}

function RateRow({ rate, locale }: { readonly rate: ILiveRate; readonly locale: string }) {
  const t = useTranslations('dashboard.liveRates');
  const trend = displayTrend(rate);
  const meta = LIVE_RATE_META[rate.id];
  const delta = formatLiveDelta(rate, locale);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
          meta.accent,
        )}
      >
        <Icon name={meta.icon} className="text-base" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {t(rate.id as LiveRateId)}
        </p>
        {rate.status === 'unavailable' ? (
          <p className="text-xs text-muted-fg">{t('unavailable')}</p>
        ) : (
          <p
            className={cn(
              'text-xs tabular-nums',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-danger',
              trend === 'flat' && 'text-muted-fg',
            )}
          >
            {delta || t('flat')}
          </p>
        )}
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatLivePrice(rate, locale)}
      </p>
    </div>
  );
}

export function HeaderLiveRates() {
  const t = useTranslations('shell.header');
  const tDash = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const ratesQ = useQuery({
    queryKey: ['markets', 'live'],
    queryFn: fetchLiveRates,
    enabled: Boolean(user),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  if (!user) return null;

  const contentDir = locale === 'en' ? 'ltr' : 'rtl';
  const rates = ratesQ.data?.rates ?? EMPTY_LIVE_RATES.rates;
  const byId = new Map(rates.map((r) => [r.id, r]));
  const isError = ratesQ.isError && !ratesQ.data;

  return (
    <HeaderActionTooltip label={t('liveRatesAria')} disabled={open}>
      <span className="inline-flex">
        <DropdownMenu dir="ltr" modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="zarva-header-action"
              aria-label={t('liveRatesAria')}
            >
              <Icon
                name={open ? 'graph-up-bold' : 'graph-up-linear'}
                className="zarva-header-action__icon text-[1.25rem]"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            className="w-[min(100vw-1.5rem,20rem)] min-w-[16rem] p-0"
          >
            <div dir={contentDir} className="overflow-hidden rounded-[inherit]">
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">{t('liveRatesTitle')}</p>
              </div>
              <div className="max-h-80 overflow-y-auto zarva-scrollbar">
                {isError ? (
                  <ErrorState
                    compact
                    title={t('liveRatesError')}
                    description={tDash('ratesErrorDescription')}
                    retryLabel={tCommon('retry')}
                    onRetry={() => void ratesQ.refetch()}
                  />
                ) : (
                  RATE_ORDER.map((id) => {
                    const rate = byId.get(id);
                    if (!rate) return null;
                    return <RateRow key={id} rate={rate} locale={locale} />;
                  })
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </HeaderActionTooltip>
  );
}
