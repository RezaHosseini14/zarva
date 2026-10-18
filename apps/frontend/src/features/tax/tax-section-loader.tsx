import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getTaxCapabilities, getTaxFilings, getTaxSummary } from '@/features/tax/get-tax-data';
import { taxSummaryToKpiItems } from '@/features/tax/tax-summary-mapper';
import { TaxSubmitToolbar } from '@/features/tax/tax-submit-toolbar';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function TaxSectionLoaded() {
  const t = await getTranslations('modules.tax');
  const [result, caps] = await Promise.all([
    loadServerApiSection(async () => {
      const [rows, summary] = await Promise.all([getTaxFilings(), getTaxSummary()]);
      return { rows, summary };
    }),
    loadServerApiSection(() => getTaxCapabilities()),
  ]);
  const submitConfigured = caps.ok ? caps.data.submitConfigured : false;
  if (!result.ok) {
    return (
      <>
        <TaxSubmitToolbar submitConfigured={submitConfigured} />
        <SimpleDomainPage
          moduleKey="tax"
          rows={[]}
          chrome="body"
          isError
          errorKind={result.error.kind}
        />
      </>
    );
  }
  return (
    <>
      <TaxSubmitToolbar submitConfigured={submitConfigured} />
      <SimpleDomainPage
        moduleKey="tax"
        chrome="body"
        rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
        kpiItems={taxSummaryToKpiItems(result.data.summary, {
          openLabel: t('kpi.a'),
          filedLabel: t('kpi.b'),
        })}
      />
    </>
  );
}

export async function TaxSectionLoader() {
  const t = await getTranslations('modules.tax');
  return (
    <WrapSimpleDomainLoader
      moduleKey="tax"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'bill-list-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <TaxSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
