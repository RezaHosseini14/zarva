import { getTranslations } from 'next-intl/server';

import { AccountingSectionPage } from '@/features/accounting/accounting-section-page';
import {
  ACCOUNTING_ROWS_KPI_SLOTS,
  resolveAccountingSkeletonKpis,
} from '@/features/accounting/accounting-kpi-slots';
import {
  getAccountingLedger,
  getAccountingSection,
} from '@/features/accounting/get-accounting-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IProps {
  readonly navKey: string;
  readonly descriptionKey: string;
  readonly mode?: 'table' | 'ledger';
  readonly section?:
    | 'cash-bank'
    | 'income'
    | 'expenses'
    | 'receivables'
    | 'payables'
    | 'transactions';
}

async function AccountingSectionLoaded({
  navKey,
  descriptionKey,
  mode = 'table',
  section,
}: IProps) {
  if (mode === 'ledger') {
    const result = await loadServerApiSection(() => getAccountingLedger());
    if (!result.ok) {
      return (
        <AccountingSectionPage
          navKey={navKey}
          descriptionKey={descriptionKey}
          mode="ledger"
          ledgerRows={[]}
          chrome="body"
          isError
          errorKind={result.error.kind}
        />
      );
    }
    return (
      <AccountingSectionPage
        navKey={navKey}
        descriptionKey={descriptionKey}
        mode="ledger"
        ledgerRows={result.data}
        chrome="body"
      />
    );
  }

  const result = await loadServerApiSection(async () =>
    section ? getAccountingSection(section) : [],
  );
  if (!result.ok) {
    return (
      <AccountingSectionPage
        navKey={navKey}
        descriptionKey={descriptionKey}
        mode="table"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <AccountingSectionPage
      navKey={navKey}
      descriptionKey={descriptionKey}
      mode="table"
      rows={result.data}
      chrome="body"
    />
  );
}

export async function AccountingSectionLoader(props: IProps) {
  const t = await getTranslations('modules.accounting');
  return (
    <StreamedDomainChrome
      messageNs="modules.accounting"
      titlePath={`nav.${props.navKey}`}
      descriptionPath={props.descriptionKey}
      pathForNav="/accounting"
      skeletonKpis={resolveAccountingSkeletonKpis(t, ACCOUNTING_ROWS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t('cols.ref'), t('cols.description'), t('cols.amount')]}
    >
      <AccountingSectionLoaded {...props} />
    </StreamedDomainChrome>
  );
}
