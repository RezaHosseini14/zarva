import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getAiInsights, getAiSummary } from '@/features/ai/get-ai-data';
import { aiSummaryToKpiItems } from '@/features/ai/ai-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function AiSectionLoaded() {
  const t = await getTranslations('modules.ai');
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getAiInsights(), getAiSummary()]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="ai"
        variant="insights"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
        insightsRaw
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="ai"
      variant="insights"
      chrome="body"
      rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      kpiItems={aiSummaryToKpiItems(result.data.summary, {
        insightsLabel: t('kpi.a'),
        criticalLabel: t('kpi.b'),
      })}
      insightsRaw
    />
  );
}

export async function AiSectionLoader() {
  const t = await getTranslations('modules.ai');
  return (
    <WrapSimpleDomainLoader
      moduleKey="ai"
      variant="insights"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'chart-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'danger-triangle-bold', accent: ACCENT.warning },
      ]}
    >
      <AiSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
