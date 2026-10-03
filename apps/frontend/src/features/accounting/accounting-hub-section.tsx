import { getTranslations } from 'next-intl/server';

import { AccountingHubPage } from '@/features/accounting/accounting-hub-page';
import {
  ACCOUNTING_HUB_KPI_SLOTS,
  ACCOUNTING_HUB_TILES,
  resolveAccountingSkeletonKpis,
} from '@/features/accounting/accounting-kpi-slots';
import { getAccountingSummary } from '@/features/accounting/get-accounting-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function AccountingHubLoaded() {
  const result = await loadServerApiSection(() => getAccountingSummary());
  if (!result.ok) {
    return (
      <AccountingHubPage
        summary={{ cash: '—', ar: '—', ap: '—', pl: '—' }}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return <AccountingHubPage summary={result.data} chrome="body" />;
}

export async function AccountingHubSection() {
  const t = await getTranslations('modules.accounting');
  return (
    <StreamedDomainChrome
      messageNs="modules.accounting"
      pathForNav="/accounting"
      skeletonVariant="hub"
      skeletonKpis={resolveAccountingSkeletonKpis(t, ACCOUNTING_HUB_KPI_SLOTS)}
      skeletonHubTiles={ACCOUNTING_HUB_TILES.map((tile) => ({
        title: t(tile.titleKey),
        description: t(tile.descKey),
        icon: tile.icon,
        accent: tile.accent,
      }))}
    >
      <AccountingHubLoaded />
    </StreamedDomainChrome>
  );
}
