import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getGoldLedger } from '@/features/gold/get-gold-data';
import { GoldLedgerPage } from '@/features/gold/gold-ledger-page';
import {
  GOLD_LEDGER_COLUMN_KEYS,
  GOLD_LEDGER_KPI_SLOTS,
  resolveGoldColumnHeaders,
  resolveGoldSkeletonKpis,
} from '@/features/gold/gold-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function Section() {
  const result = await loadServerApiSection(() => getGoldLedger());
  if (!result.ok) {
    return <GoldLedgerPage rows={[]} chrome="body" isError errorKind={result.error.kind} />;
  }
  return <GoldLedgerPage rows={result.data} chrome="body" />;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.gold');

  return (
    <StreamedDomainChrome
      messageNs="modules.gold"
      titlePath="nav.ledger"
      descriptionPath="ledgerDescription"
      pathForNav="/gold"
      skeletonKpis={resolveGoldSkeletonKpis(t, GOLD_LEDGER_KPI_SLOTS)}
      skeletonColumnHeaders={resolveGoldColumnHeaders(t, GOLD_LEDGER_COLUMN_KEYS)}
    >
      <Section />
    </StreamedDomainChrome>
  );
}
