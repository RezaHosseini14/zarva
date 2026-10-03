import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CustomersListSection } from '@/features/parties/customers-list-section';
import {
  PARTIES_COLUMN_KEYS,
  partiesListKpiSlots,
  resolvePartiesColumnHeaders,
  resolvePartiesSkeletonKpis,
} from '@/features/parties/parties-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface ICustomersPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function CustomersPage({ params }: ICustomersPageProps) {
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
      <CustomersListSection chrome="body" />
    </StreamedDomainChrome>
  );
}
