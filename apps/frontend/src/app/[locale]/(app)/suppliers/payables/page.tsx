import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSuppliers } from '@/features/catalog/get-catalog-data';
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
  const result = await loadServerApiSection(() => getSuppliers());
  if (!result.ok) {
    return (
      <PartiesListPage
        kind="suppliers"
        rows={[]}
        isError
        errorKind={result.error.kind}
        chrome="body"
      />
    );
  }
  const rows = result.data.filter((c) => c.balance !== '۰');
  return <PartiesListPage kind="suppliers" rows={rows} chrome="body" />;
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
      <Section />
    </StreamedDomainChrome>
  );
}
