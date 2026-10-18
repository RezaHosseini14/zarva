'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText } from '@/components/business/metrics';
import type { ICustomersSummary, IPartyRow, ISuppliersSummary } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import {
  customersSummaryToKpiItems,
  suppliersSummaryToKpiItems,
} from '@/features/parties/parties-summary-mapper';

interface IProps {
  readonly kind: 'customers' | 'suppliers';
  readonly rows: ReadonlyArray<IPartyRow>;
  readonly customersSummary?: ICustomersSummary | null;
  readonly suppliersSummary?: ISuppliersSummary | null;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

const EMPTY_CUSTOMERS: ICustomersSummary = {
  count: 0,
  openReceivablesIrt: 0,
  lifetimeSalesIrt: 0,
};

const EMPTY_SUPPLIERS: ISuppliersSummary = {
  count: 0,
  openPayablesIrt: 0,
  lifetimePurchasesIrt: 0,
};

export function PartiesListPage({
  kind,
  rows,
  customersSummary = null,
  suppliersSummary = null,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations(`modules.${kind}`);
  const locale = useLocale();
  const base = kind === 'customers' ? '/customers' : '/suppliers';
  const labels = {
    count: t('kpi.count'),
    balance: t('kpi.balance'),
    total: t('kpi.total'),
  };
  const kpiItems =
    kind === 'customers'
      ? customersSummaryToKpiItems(customersSummary ?? EMPTY_CUSTOMERS, labels)
      : suppliersSummaryToKpiItems(suppliersSummary ?? EMPTY_SUPPLIERS, labels);

  return (
    <DomainListPage<IPartyRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      kpis={[...kpiItems]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: base, label: t('nav.list') },
            {
              href: kind === 'customers' ? `${base}/receivables` : `${base}/payables`,
              label: t('nav.balances'),
            },
          ]}
        />
      }
      columns={[
        {
          id: 'name',
          header: t('cols.name'),
          cell: (r) => (
            <Link href={`/${locale}${base}/${r.id}`} className="text-primary hover:underline">
              {r.name}
            </Link>
          ),
        },
        { id: 'contact', header: t('cols.contact'), cell: (r) => r.contact },
        { id: 'balance', header: t('cols.balance'), cell: (r) => <MoneyText value={r.balance} /> },
        { id: 'last', header: t('cols.lastTxn'), cell: (r) => r.lastTxn },
        { id: 'total', header: t('cols.total'), cell: (r) => <MoneyText value={r.total} /> },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge
              label={t(`status.${r.status}`)}
              tone={r.status === 'active' ? 'success' : 'neutral'}
              icon={r.status === 'active' ? 'check-read-bold' : 'notes-bold'}
            />
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="users-group-rounded-bold"
      emptyAccent="bg-info/15 text-info ring-info/25"
    />
  );
}
