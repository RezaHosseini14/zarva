import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/page/error-state';
import { EMPTY_LIVE_RATES } from '@/features/dashboard/empty-live-rates';
import { fetchLiveMarketRates } from '@/features/dashboard/fetch-live-market-rates';
import { LiveRatesIsland } from '@/features/dashboard/live-rates-island';

export async function DashboardLiveRatesSection() {
  const t = await getTranslations('dashboard');
  let rates = EMPTY_LIVE_RATES;
  let failed = false;

  try {
    rates = await fetchLiveMarketRates();
  } catch {
    failed = true;
  }

  if (failed && rates === EMPTY_LIVE_RATES) {
    return (
      <ErrorState
        className="mb-4"
        title={t('ratesErrorTitle')}
        description={t('ratesErrorDescription')}
      />
    );
  }

  return <LiveRatesIsland initialRates={rates} />;
}
