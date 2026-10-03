import { getTranslations } from 'next-intl/server';

import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getIntegrationsSummary } from '@/features/integrations/get-integrations-data';
import { integrationsSummaryToKpiItems } from '@/features/integrations/integrations-summary-mapper';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';
import type { IconName } from '@/components/ui/icon';
import { ACCENT } from '@/lib/lists/skeleton-kpi';

const HUB_LINKS: ReadonlyArray<{
  readonly path: string;
  readonly titleKey: string;
  readonly descKey: string;
  readonly icon: IconName;
  readonly accent: string;
}> = [
  {
    path: '/integrations/devices',
    titleKey: 'hub.devices',
    descKey: 'hub.devicesDesc',
    icon: 'plug-circle-bold',
    accent: ACCENT.primary,
  },
  {
    path: '/integrations/scale',
    titleKey: 'hub.scale',
    descKey: 'hub.scaleDesc',
    icon: 'scale-bold',
    accent: ACCENT.info,
  },
  {
    path: '/integrations/api',
    titleKey: 'hub.api',
    descKey: 'hub.apiDesc',
    icon: 'layers-minimalistic-bold',
    accent: ACCENT.success,
  },
  {
    path: '/integrations/webhooks',
    titleKey: 'hub.webhooks',
    descKey: 'hub.webhooksDesc',
    icon: 'transfer-horizontal-bold',
    accent: ACCENT.warning,
  },
];

async function IntegrationsHubSectionLoaded() {
  const t = await getTranslations('modules.integrations');
  const result = await loadServerApiSection(() => getIntegrationsSummary());
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="integrations"
        variant="hub"
        chrome="body"
        rows={[]}
        hubLinks={HUB_LINKS}
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="integrations"
      variant="hub"
      chrome="body"
      rows={[]}
      hubLinks={HUB_LINKS}
      kpiItems={integrationsSummaryToKpiItems(result.data, {
        connectedLabel: t('kpi.a'),
        pendingLabel: t('kpi.b'),
      })}
    />
  );
}

export async function IntegrationsHubSectionLoader() {
  const t = await getTranslations('modules.integrations');
  return (
    <WrapSimpleDomainLoader
      moduleKey="integrations"
      variant="hub"
      pathForNav="/integrations"
      skeletonKpis={[
        { label: t('kpi.a'), icon: 'plug-circle-bold', accent: ACCENT.success },
        { label: t('kpi.b'), icon: 'danger-triangle-bold', accent: ACCENT.warning },
      ]}
      skeletonHubTiles={HUB_LINKS.map((l) => ({
        title: t(l.titleKey),
        description: t(l.descKey),
        icon: l.icon,
        accent: l.accent,
      }))}
    >
      <IntegrationsHubSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
