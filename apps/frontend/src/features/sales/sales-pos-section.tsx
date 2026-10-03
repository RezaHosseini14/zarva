import { getTranslations } from 'next-intl/server';

import { getInventoryItems } from '@/features/catalog/get-catalog-data';
import { SalesPosBodySkeleton } from '@/features/sales/sales-pos-body-skeleton';
import { SalesPosPage } from '@/features/sales/sales-pos-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function SalesPosLoaded() {
  const result = await loadServerApiSection(() => getInventoryItems());
  if (!result.ok) {
    return <SalesPosPage products={[]} chrome="body" isError errorKind={result.error.kind} />;
  }
  return <SalesPosPage products={result.data} chrome="body" />;
}

export async function SalesPosSection() {
  const t = await getTranslations('modules.sales');
  return (
    <StreamedDomainChrome
      messageNs="modules.sales"
      titlePath="nav.pos"
      descriptionPath="posDescription"
      pathForNav="/sales/new"
      skeletonFallback={
        <SalesPosBodySkeleton
          scanPlaceholder={t('posScan')}
          addLabel={t('posAdd')}
          cartTitle={t('posCartTitle')}
          cartCount={t('posCartCount', { count: '—' })}
          checkoutTitle={t('posCheckout')}
          checkoutHint={t('posCheckoutHint')}
          customerLabel={t('cols.customer')}
          customerPlaceholder={t('posCustomerPh')}
          subtotalLabel={t('posSubtotal')}
          taxLabel={t('posTax')}
          totalLabel={t('posTotal')}
          payLabel={t('posPay')}
        />
      }
    >
      <SalesPosLoaded />
    </StreamedDomainChrome>
  );
}
