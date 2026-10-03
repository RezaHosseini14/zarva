import { getTranslations } from 'next-intl/server';

import { getSaleReturns } from '@/features/sales/get-sales-data';
import { SalesReturnsPage } from '@/features/sales/sales-returns-page';
import {
  SALES_RETURNS_KPI_SLOTS,
  resolveSalesSkeletonKpis,
} from '@/features/sales/sales-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function SalesReturnsLoaded() {
  const result = await loadServerApiSection(() => getSaleReturns());
  if (!result.ok) {
    return <SalesReturnsPage rows={[]} chrome="body" isError errorKind={result.error.kind} />;
  }
  return <SalesReturnsPage rows={result.data} chrome="body" />;
}

export async function SalesReturnsSection() {
  const t = await getTranslations('modules.sales');
  return (
    <StreamedDomainChrome
      messageNs="modules.sales"
      titlePath="nav.returns"
      descriptionPath="returnsDescription"
      pathForNav="/sales/returns"
      skeletonKpis={resolveSalesSkeletonKpis(t, SALES_RETURNS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[
        t('cols.number'),
        t('cols.invoice'),
        t('cols.date'),
        t('cols.amount'),
      ]}
    >
      <SalesReturnsLoaded />
    </StreamedDomainChrome>
  );
}
