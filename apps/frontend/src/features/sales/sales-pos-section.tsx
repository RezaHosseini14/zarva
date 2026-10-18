import { getTranslations } from 'next-intl/server';

import { getInventoryItems } from '@/features/catalog/get-catalog-data';
import { getTodayGoldRateAction } from '@/features/gold/gold-actions';
import { getCustomerSmsCapabilities, getSaleCustomers } from '@/features/sales/get-sales-data';
import { SalesPosBodySkeleton } from '@/features/sales/sales-pos-body-skeleton';
import { SalesPosPage } from '@/features/sales/sales-pos-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function SalesPosLoaded() {
  const [inv, customers, lockedRate, smsCaps] = await Promise.all([
    loadServerApiSection(() => getInventoryItems()),
    loadServerApiSection(() => getSaleCustomers()),
    getTodayGoldRateAction(),
    getCustomerSmsCapabilities(),
  ]);

  if (!inv.ok) {
    return (
      <SalesPosPage
        products={[]}
        customers={[]}
        lockedRate={null}
        customerSmsEnabled={smsCaps.enabled}
        chrome="body"
        isError
        errorKind={inv.error.kind}
      />
    );
  }

  return (
    <SalesPosPage
      products={inv.data}
      customers={customers.ok ? customers.data : []}
      lockedRate={lockedRate}
      customerSmsEnabled={smsCaps.enabled}
      chrome="body"
      isError={!customers.ok}
      errorKind={customers.ok ? undefined : customers.error.kind}
    />
  );
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
