import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getWorkshopOrders } from '@/features/workshop/get-workshop-data';
import { WorkshopPage } from '@/features/workshop/workshop-page';
import {
  resolveWorkshopColumnHeaders,
  resolveWorkshopSkeletonKpis,
} from '@/features/workshop/workshop-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getWorkshopOrders());
  if (!result.ok) {
    return <WorkshopPage rows={[]} isError errorKind={result.error.kind} chrome="body" />;
  }
  return <WorkshopPage rows={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.workshop');

  return (
    <StreamedDomainChrome
      messageNs="modules.workshop"
      skeletonKpis={resolveWorkshopSkeletonKpis(t)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolveWorkshopColumnHeaders(t)}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
