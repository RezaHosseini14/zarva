'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { MoneyText } from '@/components/business/metrics';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IReturnRow {
  readonly id: string;
  readonly number: string;
  readonly invoice: string;
  readonly date: string;
  readonly amount: string;
}

interface IProps {
  readonly rows: ReadonlyArray<IReturnRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SalesReturnsPage({ rows, isError, errorKind, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.sales');
  return (
    <DomainListPage<IReturnRow>
      shellTitle={t('returnsTitle')}
      title={t('returnsTitle')}
      description={t('returnsDescription')}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'count',
          label: t('kpi.returns'),
          value: String(rows.length),
          icon: 'refresh-bold',
          accent: 'bg-warning/15 text-warning ring-warning/25',
        },
        {
          id: 'value',
          label: t('kpi.returnValue'),
          value: rows[0]?.amount ?? '—',
          icon: 'hand-money-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/sales', label: t('nav.invoices') },
            { href: '/sales/new', label: t('nav.pos') },
            { href: '/sales/returns', label: t('nav.returns') },
            { href: '/sales/payments', label: t('nav.payments') },
          ]}
        />
      }
      columns={[
        { id: 'number', header: t('cols.number'), cell: (r) => r.number },
        { id: 'invoice', header: t('cols.invoice'), cell: (r) => r.invoice },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'amount', header: t('cols.amount'), cell: (r) => <MoneyText value={r.amount} /> },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="transfer-horizontal-bold"
      emptyAccent="bg-warning/15 text-warning ring-warning/25"
    />
  );
}
