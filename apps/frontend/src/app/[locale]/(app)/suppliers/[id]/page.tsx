import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DetailLoadError } from '@/components/page/detail-load-error';
import { getSupplier } from '@/features/catalog/get-catalog-data';
import { PartyDetailPage } from '@/features/parties/party-detail-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
}

async function Section({ id }: { readonly id: string }) {
  const result = await loadServerApiSection(() => getSupplier(id));
  if (!result.ok) {
    return <DetailLoadError errorKind={result.error.kind} chrome="body" />;
  }
  return <PartyDetailPage kind="suppliers" party={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.suppliers');

  return (
    <StreamedDomainChrome
      messageNs="modules.suppliers"
      pathForNav="/suppliers"
      showHeader={false}
      skeletonFallback={
        <DomainListBodySkeleton
          skeletonKpis={[
            {
              label: t('cols.balance'),
              icon: 'wallet-money-bold',
              accent: ACCENT.warning,
            },
            {
              label: t('cols.total'),
              icon: 'hand-money-bold',
              accent: ACCENT.primary,
            },
            {
              label: t('cols.lastTxn'),
              icon: 'clipboard-list-bold',
              accent: ACCENT.info,
            },
          ]}
          kpiOnly
        />
      }
    >
      <Section id={id} />
    </StreamedDomainChrome>
  );
}
