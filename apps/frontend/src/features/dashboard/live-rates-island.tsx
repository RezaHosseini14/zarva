'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ILiveRatesResponse } from '@zarva/shared';

import { ErrorState } from '@/components/page/error-state';
import { EMPTY_LIVE_RATES } from '@/features/dashboard/empty-live-rates';
import { LiveRatesStrip } from '@/features/dashboard/live-rates-strip';

interface ILiveRatesIslandProps {
  readonly initialRates: ILiveRatesResponse;
}

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

export function LiveRatesIsland({ initialRates }: ILiveRatesIslandProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  const ratesQ = useQuery({
    queryKey: ['markets', 'live'],
    queryFn: fetchLiveRates,
    initialData: initialRates,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const rates = ratesQ.data ?? EMPTY_LIVE_RATES;

  if (ratesQ.isError && rates === EMPTY_LIVE_RATES) {
    return (
      <ErrorState
        className="mb-4"
        title={t('ratesErrorTitle')}
        description={t('ratesErrorDescription')}
        retryLabel={tc('retry')}
        onRetry={() => void ratesQ.refetch()}
      />
    );
  }

  return <LiveRatesStrip rates={rates.rates} />;
}
