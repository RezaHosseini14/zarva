'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { MoneyText } from '@/components/business/metrics';
import type { ILedgerRow } from '@zarva/shared';
import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { LedgerTable } from '@/components/page/ledger-table';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IProps {
  readonly navKey: string;
  readonly descriptionKey: string;
  readonly mode?: 'table' | 'ledger';
  readonly rows?: ReadonlyArray<IRow>;
  readonly ledgerRows?: ReadonlyArray<ILedgerRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function AccountingSectionPage({
  navKey,
  descriptionKey,
  mode = 'table',
  rows = [],
  ledgerRows = [],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.accounting');
  const isBody = chrome === 'body';

  if (mode === 'ledger') {
    const opening = ledgerRows[0]?.balance ?? '—';
    const closing = ledgerRows[ledgerRows.length - 1]?.balance ?? '—';
    const body = (
      <>
        {isBody ? null : (
          <PageHeader title={t(`nav.${navKey}`)} description={t(descriptionKey)} />
        )}
        {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
        <LedgerTable
          rows={[...ledgerRows]}
          openingLabel={t('kpi.opening')}
          openingValue={opening}
          closingLabel={t('kpi.closing')}
          closingValue={closing}
          headers={{
            date: t('cols.date'),
            description: t('cols.description'),
            debit: t('cols.debit'),
            credit: t('cols.credit'),
            balance: t('cols.balance'),
          }}
        />
      </>
    );
    if (isBody) return body;
    return <AppShell title={t(`nav.${navKey}`)}>{body}</AppShell>;
  }

  return (
    <DomainListPage<IRow>
      shellTitle={t(`nav.${navKey}`)}
      title={t(`nav.${navKey}`)}
      description={t(descriptionKey)}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'n',
          label: t('kpi.rows'),
          value: String(rows.length),
          icon: 'clipboard-list-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
      ]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.ref'), cell: (r) => r.a },
        { id: 'b', header: t('cols.description'), cell: (r) => r.b },
        { id: 'c', header: t('cols.amount'), cell: (r) => <MoneyText value={r.c} /> },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="calculator-bold"
      emptyAccent="bg-info/15 text-info ring-info/25"
    />
  );
}
