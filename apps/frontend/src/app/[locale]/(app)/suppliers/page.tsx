import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SuppliersListSection } from '@/features/parties/suppliers-list-section';
import {
  PARTIES_COLUMN_KEYS,
  partiesListKpiSlots,
  resolvePartiesColumnHeaders,
  resolvePartiesSkeletonKpis,
} from '@/features/parties/parties-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.suppliers');

  return (
    <StreamedDomainChrome
      messageNs="modules.suppliers"
      skeletonKpis={resolvePartiesSkeletonKpis(t, partiesListKpiSlots('suppliers'))}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolvePartiesColumnHeaders(t, PARTIES_COLUMN_KEYS)}
    >
      <SuppliersListSection chrome="body" />
    </StreamedDomainChrome>
  );
}
