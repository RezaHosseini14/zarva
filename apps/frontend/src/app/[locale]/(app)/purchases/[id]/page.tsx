import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DetailLoadError } from '@/components/page/detail-load-error';
import { getPurchase } from '@/features/catalog/get-catalog-data';
import { PurchasesDetailPage } from '@/features/purchases/purchases-detail-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
}

async function Section({ id }: { readonly id: string }) {
  const result = await loadServerApiSection(() => getPurchase(id));
  if (!result.ok) {
    return <DetailLoadError errorKind={result.error.kind} chrome="body" />;
  }
  return <PurchasesDetailPage row={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.purchases');

  return (
    <StreamedDomainChrome
      messageNs="modules.purchases"
      pathForNav="/purchases"
      showHeader={false}
      skeletonFallback={
        <DomainListBodySkeleton
          skeletonKpis={[
            { label: t('cols.weight'), icon: 'scale-bold', accent: ACCENT.info },
            { label: t('cols.amount'), icon: 'delivery-bold', accent: ACCENT.primary },
          ]}
          kpiOnly
        />
      }
    >
      <Section id={id} />
    </StreamedDomainChrome>
  );
}
