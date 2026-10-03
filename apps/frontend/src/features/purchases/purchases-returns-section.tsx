import { getTranslations } from 'next-intl/server';

import { getPurchaseReturns } from '@/features/purchases/get-purchases-data';
import { PurchasesReturnsPage } from '@/features/purchases/purchases-returns-page';
import {
  PURCHASES_RETURNS_KPI_SLOTS,
  resolvePurchasesSkeletonKpis,
} from '@/features/purchases/purchases-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function PurchasesReturnsLoaded() {
  const result = await loadServerApiSection(() => getPurchaseReturns());
  if (!result.ok) {
    return <PurchasesReturnsPage rows={[]} chrome="body" isError errorKind={result.error.kind} />;
  }
  return <PurchasesReturnsPage rows={result.data} chrome="body" />;
}

export async function PurchasesReturnsSection() {
  const t = await getTranslations('modules.purchases');
  return (
    <StreamedDomainChrome
      messageNs="modules.purchases"
      titlePath="nav.returns"
      descriptionPath="returnsDescription"
      pathForNav="/purchases/returns"
      skeletonKpis={resolvePurchasesSkeletonKpis(t, PURCHASES_RETURNS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[
        t('cols.number'),
        t('cols.purchase'),
        t('cols.date'),
        t('cols.amount'),
      ]}
    >
      <PurchasesReturnsLoaded />
    </StreamedDomainChrome>
  );
}
