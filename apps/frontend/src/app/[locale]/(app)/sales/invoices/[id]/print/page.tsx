import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DetailLoadError } from '@/components/page/detail-load-error';
import { getSaleInvoiceDetail } from '@/features/catalog/get-catalog-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainFormBodySkeleton } from '@/lib/lists/domain-page-skeleton';
import { ProgressiveSection } from '@/lib/lists/progressive-section';

import { PrintAutoFlag } from './print-auto-flag';

interface IPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
  readonly searchParams: Promise<{ autoprint?: string }>;
}

async function Section({
  id,
  autoPrint,
}: {
  readonly id: string;
  readonly autoPrint: boolean;
}) {
  const result = await loadServerApiSection(() => getSaleInvoiceDetail(id));
  if (!result.ok) {
    return <DetailLoadError errorKind={result.error.kind} />;
  }
  return <PrintAutoFlag invoice={result.data} autoPrint={autoPrint} />;
}

export default async function Page({ params, searchParams }: IPageProps) {
  const { locale, id } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('modules.sales');

  return (
    <ProgressiveSection
      fallback={
        <DomainFormBodySkeleton
          title={t('print.documentTitle')}
          icon="document-text-bold"
          fields={[
            { label: t('print.invoiceNumber') },
            { label: t('print.date') },
            { label: t('print.customer') },
            { label: t('print.grandTotal') },
          ]}
        />
      }
    >
      <Section id={id} autoPrint={sp.autoprint === '1'} />
    </ProgressiveSection>
  );
}
