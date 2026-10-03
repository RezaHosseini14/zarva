import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DetailLoadError } from '@/components/page/detail-load-error';
import { getInventoryItem } from '@/features/catalog/get-catalog-data';
import { InventoryProductDetailPage } from '@/features/inventory/inventory-product-detail';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
}

async function Section({ id }: { readonly id: string }) {
  const result = await loadServerApiSection(() => getInventoryItem(id));
  if (!result.ok) {
    return <DetailLoadError errorKind={result.error.kind} chrome="body" />;
  }
  return <InventoryProductDetailPage row={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.inventory');

  return (
    <StreamedDomainChrome
      messageNs="modules.inventory"
      pathForNav="/inventory"
      showHeader={false}
      skeletonFallback={
        <DomainListBodySkeleton
          skeletonKpis={[
            { label: t('cols.weight'), icon: 'scale-bold', accent: ACCENT.info },
            { label: t('cols.purity'), icon: 'medal-star-bold', accent: ACCENT.primary },
            { label: t('cols.value'), icon: 'dollar-bold', accent: ACCENT.success },
          ]}
          kpiOnly
        />
      }
    >
      <Section id={id} />
    </StreamedDomainChrome>
  );
}
