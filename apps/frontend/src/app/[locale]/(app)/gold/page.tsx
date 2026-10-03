import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getGoldTransactions } from '@/features/gold/get-gold-data';
import { GoldOverviewPage } from '@/features/gold/gold-overview-page';
import {
  GOLD_OVERVIEW_COLUMN_KEYS,
  GOLD_OVERVIEW_KPI_SLOTS,
  resolveGoldColumnHeaders,
  resolveGoldSkeletonKpis,
} from '@/features/gold/gold-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getGoldTransactions());
  if (!result.ok) {
    return <GoldOverviewPage rows={[]} isError errorKind={result.error.kind} chrome="body" />;
  }
  return <GoldOverviewPage rows={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.gold');

  return (
    <StreamedDomainChrome
      messageNs="modules.gold"
      skeletonKpis={resolveGoldSkeletonKpis(t, GOLD_OVERVIEW_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolveGoldColumnHeaders(t, GOLD_OVERVIEW_COLUMN_KEYS)}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
