'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText } from '@/components/business/metrics';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IPayRow {
  readonly id: string;
  readonly ref: string;
  readonly customer: string;
  readonly method: string;
  readonly amount: string;
}

interface IProps {
  readonly rows: ReadonlyArray<IPayRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SalesPaymentsPage({ rows, isError, errorKind, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.sales');
  return (
    <DomainListPage<IPayRow>
      shellTitle={t('paymentsTitle')}
      title={t('paymentsTitle')}
      description={t('paymentsDescription')}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'today',
          label: t('kpi.paymentsToday'),
          value: rows[0]?.amount ?? '—',
          icon: 'card-bold',
          accent: 'bg-success/15 text-success ring-success/25',
        },
        {
          id: 'pending',
          label: t('kpi.pending'),
          value: String(rows.length),
          icon: 'clipboard-list-bold',
          accent: 'bg-warning/15 text-warning ring-warning/25',
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
        { id: 'ref', header: t('cols.number'), cell: (r) => r.ref },
        { id: 'customer', header: t('cols.customer'), cell: (r) => r.customer },
        { id: 'method', header: t('cols.method'), cell: (r) => r.method },
        { id: 'amount', header: t('cols.amount'), cell: (r) => <MoneyText value={r.amount} /> },
        {
          id: 'status',
          header: t('cols.status'),
          cell: () => (
            <StatusBadge label={t('payment.paid')} tone="success" icon="check-read-bold" />
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="wallet-money-bold"
      emptyAccent="bg-success/15 text-success ring-success/25"
    />
  );
}
