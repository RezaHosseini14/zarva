import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getWorkshopProduction } from '@/features/workshop/get-workshop-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function WorkshopProductionLoaded() {
  const result = await loadServerApiSection(() => getWorkshopProduction());
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="workshopProduction"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return <SimpleDomainPage moduleKey="workshopProduction" rows={result.data} chrome="body" />;
}

export async function WorkshopProductionSection() {
  const t = await getTranslations('modules.workshopProduction');
  return (
    <StreamedDomainChrome
      messageNs="modules.workshop"
      titlePath="nav.production"
      pathForNav="/workshop/production"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'chart-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <WorkshopProductionLoaded />
    </StreamedDomainChrome>
  );
}
