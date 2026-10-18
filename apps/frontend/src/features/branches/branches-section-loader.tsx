import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getBranches, getBranchesSummary } from '@/features/branches/get-branches-data';
import { branchesSummaryToKpiItems } from '@/features/branches/branches-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function BranchesSectionLoaded() {
  const t = await getTranslations('modules.branches');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getBranches(), getBranchesSummary()]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="branches"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="branches"
      chrome="body"
      rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      kpiItems={branchesSummaryToKpiItems(result.data.summary, {
        totalLabel: t('kpi.a'),
        activeLabel: t('kpi.b'),
      })}
    />
  );
}

export async function BranchesSectionLoader() {
  const t = await getTranslations('modules.branches');
  return (
    <WrapSimpleDomainLoader
      moduleKey="branches"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'buildings-2-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <BranchesSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
