import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getInventoryItems } from '@/features/catalog/get-catalog-data';
import { InventorySimpleList } from '@/features/inventory/inventory-simple-list';
import {
  INVENTORY_ROWS_KPI_SLOTS,
  resolveInventorySkeletonKpis,
} from '@/features/inventory/inventory-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getInventoryItems());
  if (!result.ok) {
    return (
      <InventorySimpleList
        titleKey="nav.barcodes"
        descriptionKey="barcodesDescription"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  const mapped = result.data.map((i) => ({
    id: i.id,
    col1: i.name,
    col2: i.barcode,
    col3: i.sku,
  }));
  return (
    <InventorySimpleList
      titleKey="nav.barcodes"
      descriptionKey="barcodesDescription"
      rows={mapped}
      chrome="body"
    />
  );
}

export default async function Page({ params }: IProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.inventory');

  return (
    <StreamedDomainChrome
      messageNs="modules.inventory"
      titlePath="nav.barcodes"
      descriptionPath="barcodesDescription"
      pathForNav="/inventory"
      skeletonKpis={resolveInventorySkeletonKpis(t, INVENTORY_ROWS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.name'), t('cols.sku'), t('cols.value')]}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
