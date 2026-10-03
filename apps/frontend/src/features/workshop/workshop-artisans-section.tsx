import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getWorkshopArtisans } from '@/features/workshop/get-workshop-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function WorkshopArtisansLoaded() {
  const result = await loadServerApiSection(() => getWorkshopArtisans());
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="workshopArtisans"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return <SimpleDomainPage moduleKey="workshopArtisans" rows={result.data} chrome="body" />;
}

export async function WorkshopArtisansSection() {
  const t = await getTranslations('modules.workshopArtisans');
  return (
    <StreamedDomainChrome
      messageNs="modules.workshop"
      titlePath="nav.artisans"
      pathForNav="/workshop/artisans"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'chart-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <WorkshopArtisansLoaded />
    </StreamedDomainChrome>
  );
}
