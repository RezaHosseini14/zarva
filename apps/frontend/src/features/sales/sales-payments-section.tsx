import { getTranslations } from 'next-intl/server';

import { getSalePayments } from '@/features/sales/get-sales-data';
import { SalesPaymentsPage } from '@/features/sales/sales-payments-page';
import {
  SALES_PAYMENTS_KPI_SLOTS,
  resolveSalesSkeletonKpis,
} from '@/features/sales/sales-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function SalesPaymentsLoaded() {
  const result = await loadServerApiSection(() => getSalePayments());
  if (!result.ok) {
    return <SalesPaymentsPage rows={[]} chrome="body" isError errorKind={result.error.kind} />;
  }
  return <SalesPaymentsPage rows={result.data} chrome="body" />;
}

export async function SalesPaymentsSection() {
  const t = await getTranslations('modules.sales');
  return (
    <StreamedDomainChrome
      messageNs="modules.sales"
      titlePath="nav.payments"
      descriptionPath="paymentsDescription"
      pathForNav="/sales/payments"
      skeletonKpis={resolveSalesSkeletonKpis(t, SALES_PAYMENTS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[
        t('cols.number'),
        t('cols.customer'),
        t('cols.date'),
        t('cols.amount'),
        t('cols.method'),
      ]}
    >
      <SalesPaymentsLoaded />
    </StreamedDomainChrome>
  );
}
