import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getWorkshopArtisans, getWorkshopSummary } from '@/features/workshop/get-workshop-data';
import { workshopArtisansSummaryToKpiItems } from '@/features/workshop/workshop-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function WorkshopArtisansLoaded() {
  const t = await getTranslations('modules.workshopArtisans');
  const tWorkshop = await getTranslations('modules.workshop');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getWorkshopArtisans(), getWorkshopSummary()]);
    return { rows, summary };
  });
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
  return (
    <SimpleDomainPage
      moduleKey="workshopArtisans"
      rows={result.data.rows}
      chrome="body"
      kpiItems={workshopArtisansSummaryToKpiItems(result.data.summary, {
        artisansLabel: t('kpi.a'),
        openOrdersLabel: tWorkshop('kpi.open'),
      })}
    />
  );
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
