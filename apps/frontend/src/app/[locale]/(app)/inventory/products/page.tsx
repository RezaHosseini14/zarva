import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getInventoryItems } from '@/features/catalog/get-catalog-data';
import { InventoryOverviewPage } from '@/features/inventory/inventory-overview-page';
import {
  INVENTORY_OVERVIEW_COLUMN_KEYS,
  INVENTORY_OVERVIEW_KPI_SLOTS,
  resolveInventoryColumnHeaders,
  resolveInventorySkeletonKpis,
} from '@/features/inventory/inventory-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getInventoryItems());
  if (!result.ok) {
    return <InventoryOverviewPage rows={[]} isError errorKind={result.error.kind} chrome="body" />;
  }
  return <InventoryOverviewPage rows={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.inventory');

  return (
    <StreamedDomainChrome
      messageNs="modules.inventory"
      skeletonKpis={resolveInventorySkeletonKpis(t, INVENTORY_OVERVIEW_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolveInventoryColumnHeaders(t, INVENTORY_OVERVIEW_COLUMN_KEYS)}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
