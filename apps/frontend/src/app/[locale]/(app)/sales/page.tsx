import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { SalesInvoicesSection } from '@/features/sales/sales-invoices-section';
import {
  SALES_LIST_COLUMN_KEYS,
  SALES_LIST_KPI_SLOTS,
  resolveSalesColumnHeaders,
  resolveSalesSkeletonKpis,
} from '@/features/sales/sales-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface ISalesPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function SalesPage({ params }: ISalesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.sales');

  return (
    <StreamedDomainChrome
      messageNs="modules.sales"
      skeletonKpis={resolveSalesSkeletonKpis(t, SALES_LIST_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolveSalesColumnHeaders(t, SALES_LIST_COLUMN_KEYS)}
      action={
        <Button asChild>
          <Link href={`/${locale}/sales/new`}>{t('newSale')}</Link>
        </Button>
      }
    >
      <SalesInvoicesSection chrome="body" />
    </StreamedDomainChrome>
  );
}
