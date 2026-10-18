import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getJewelryPieces, getJewelrySummary } from '@/features/jewelry/get-jewelry-data';
import { jewelrySummaryToKpiItems } from '@/features/jewelry/jewelry-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function JewelrySectionLoaded() {
  const t = await getTranslations('modules.jewelry');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getJewelryPieces(), getJewelrySummary()]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="jewelry"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="jewelry"
      chrome="body"
      rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      kpiItems={jewelrySummaryToKpiItems(result.data.summary, {
        piecesLabel: t('kpi.a'),
        availableLabel: t('kpi.b'),
      })}
    />
  );
}

export async function JewelrySectionLoader() {
  const t = await getTranslations('modules.jewelry');
  return (
    <WrapSimpleDomainLoader
      moduleKey="jewelry"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'chart-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <JewelrySectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
