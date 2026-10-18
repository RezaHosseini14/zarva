import { getTranslations } from 'next-intl/server';
import type { IntegrationKind } from '@zarva/shared';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import {
  getIntegrations,
  getIntegrationsSummary,
} from '@/features/integrations/get-integrations-data';
import { integrationsSummaryToKpiItems } from '@/features/integrations/integrations-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

interface IProps {
  readonly moduleKey: string;
  readonly kind?: IntegrationKind;
}

async function IntegrationsSectionLoaded({ moduleKey, kind }: IProps) {
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([
      getIntegrations(kind),
      getIntegrationsSummary(),
    ]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey={moduleKey}
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  const hubT = await getTranslations('modules.integrations');
  return (
    <SimpleDomainPage
      moduleKey={moduleKey}
      chrome="body"
      rows={result.data.rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      kpiItems={integrationsSummaryToKpiItems(result.data.summary, {
        connectedLabel: hubT('kpi.a'),
        pendingLabel: hubT('kpi.b'),
      })}
    />
  );
}

export async function IntegrationsSectionLoader(props: IProps) {
  const t = await getTranslations(`modules.${props.moduleKey}`);
  return (
    <WrapSimpleDomainLoader
      moduleKey={props.moduleKey}
      pathForNav="/integrations"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'plug-circle-bold', accent: ACCENT.primary },
        { label: t('kpi.b'), icon: 'clipboard-list-bold', accent: ACCENT.info },
      ]}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <IntegrationsSectionLoaded {...props} />
    </WrapSimpleDomainLoader>
  );
}
