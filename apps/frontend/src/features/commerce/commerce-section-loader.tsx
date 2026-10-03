import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { commerceSummaryToKpiItems } from '@/features/commerce/commerce-summary-mapper';
import { getCommerceChannels, getCommerceSummary } from '@/features/commerce/get-commerce-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function CommerceSectionLoaded() {
  const t = await getTranslations('modules.commerce');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getCommerceChannels(), getCommerceSummary()]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="commerce"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="commerce"
      chrome="body"
      rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      kpiItems={commerceSummaryToKpiItems(result.data.summary, {
        channelsLabel: t('kpi.a'),
        liveLabel: t('kpi.b'),
      })}
    />
  );
}

export async function CommerceSectionLoader() {
  const t = await getTranslations('modules.commerce');
  return (
    <WrapSimpleDomainLoader
      moduleKey="commerce"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'shop-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'plug-circle-bold', accent: ACCENT.success },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <CommerceSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
