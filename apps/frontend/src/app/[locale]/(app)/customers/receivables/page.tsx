import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSaleCustomers } from '@/features/sales/get-sales-data';
import { mapSaleCustomerToPartyRow } from '@/features/sales/map-sales-api';
import { PartiesListPage } from '@/features/parties/parties-list-page';
import {
  PARTIES_COLUMN_KEYS,
  partiesListKpiSlots,
  resolvePartiesColumnHeaders,
  resolvePartiesSkeletonKpis,
} from '@/features/parties/parties-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getSaleCustomers());
  if (!result.ok) {
    return (
      <PartiesListPage
        kind="customers"
        rows={[]}
        isError
        errorKind={result.error.kind}
        chrome="body"
      />
    );
  }
  const rows = result.data.map(mapSaleCustomerToPartyRow).filter((c) => c.balance !== '۰');
  return <PartiesListPage kind="customers" rows={rows} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.customers');

  return (
    <StreamedDomainChrome
      messageNs="modules.customers"
      skeletonKpis={resolvePartiesSkeletonKpis(t, partiesListKpiSlots('customers'))}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolvePartiesColumnHeaders(t, PARTIES_COLUMN_KEYS)}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
