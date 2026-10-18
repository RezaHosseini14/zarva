import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DetailLoadError } from '@/components/page/detail-load-error';
import { getSaleCustomer } from '@/features/sales/get-sales-data';
import { PartyDetailPage } from '@/features/parties/party-detail-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ACCENT } from '@/lib/lists/skeleton-kpi';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import type { IPartyRow, ISaleCustomer } from '@zarva/shared';

interface IPageProps {
  readonly params: Promise<{ locale: string; id: string }>;
}

function toPartyRow(c: ISaleCustomer): IPartyRow {
  return {
    id: c.id,
    name: c.name,
    contact: c.phone,
    balance: c.balanceLabel ?? '—',
    lastTxn: c.lastTxnLabel ?? '—',
    total: c.totalLabel ?? '—',
    status: c.partyStatus ?? 'active',
  };
}

async function Section({ id }: { readonly id: string }) {
  const result = await loadServerApiSection(() => getSaleCustomer(id));
  if (!result.ok) {
    return <DetailLoadError errorKind={result.error.kind} chrome="body" />;
  }
  return (
    <PartyDetailPage kind="customers" party={toPartyRow(result.data)} chrome="body" />
  );
}

export default async function Page({ params }: IPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.customers');

  return (
    <StreamedDomainChrome
      messageNs="modules.customers"
      pathForNav="/customers"
      showHeader={false}
      skeletonFallback={
        <DomainListBodySkeleton
          skeletonKpis={[
            {
              label: t('cols.balance'),
              icon: 'wallet-money-bold',
              accent: ACCENT.warning,
            },
            {
              label: t('cols.total'),
              icon: 'hand-money-bold',
              accent: ACCENT.primary,
            },
            {
              label: t('cols.lastTxn'),
              icon: 'clipboard-list-bold',
              accent: ACCENT.info,
            },
          ]}
          kpiOnly
        />
      }
    >
      <Section id={id} />
    </StreamedDomainChrome>
  );
}
