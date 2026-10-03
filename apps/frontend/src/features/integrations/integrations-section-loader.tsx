import { getTranslations } from 'next-intl/server';
import type { IntegrationKind } from '@zarva/shared';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getIntegrations } from '@/features/integrations/get-integrations-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

interface IProps {
  readonly moduleKey: string;
  readonly kind?: IntegrationKind;
}

async function IntegrationsSectionLoaded({ moduleKey, kind }: IProps) {
  const result = await loadServerApiSection(() => getIntegrations(kind));
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
  return (
    <SimpleDomainPage
      moduleKey={moduleKey}
      chrome="body"
      rows={result.data.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
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
