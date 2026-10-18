import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getWorkshopProduction, getWorkshopSummary } from '@/features/workshop/get-workshop-data';
import { workshopProductionSummaryToKpiItems } from '@/features/workshop/workshop-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function WorkshopProductionLoaded() {
  const t = await getTranslations('modules.workshopProduction');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([
      getWorkshopProduction(),
      getWorkshopSummary(),
    ]);
    return { rows, summary };
  });
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
  return (
    <SimpleDomainPage
      moduleKey="workshopProduction"
      rows={result.data.rows}
      chrome="body"
      kpiItems={workshopProductionSummaryToKpiItems(result.data.summary, {
        batchesLabel: t('kpi.a'),
        ordersLabel: t('kpi.b'),
      })}
    />
  );
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
