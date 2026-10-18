'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { useNavigateWithTransition } from '@/features/shell/navigation-progress';
import type { ISaleInvoiceRow, ISalesSummary } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import { salesSummaryToKpiItems } from '@/features/sales/sales-summary-mapper';

interface IProps {
  readonly rows?: ReadonlyArray<ISaleInvoiceRow>;
  readonly summary?: ISalesSummary | null;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

const EMPTY_SALES_SUMMARY: ISalesSummary = {
  todayAmountIrt: 0,
  invoiceCount: 0,
  unpaidCount: 0,
  avgAmountIrt: 0,
};

export function SalesListPage({
  rows = [],
  summary = null,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.sales');
  const tc = useTranslations('common');
  const locale = useLocale();
  const navigate = useNavigateWithTransition();
  const base = `/${locale}/sales`;
  const kpiItems = salesSummaryToKpiItems(summary ?? EMPTY_SALES_SUMMARY, {
    today: t('kpi.today'),
    count: t('kpi.count'),
    avg: t('kpi.avg'),
    unpaid: t('kpi.unpaid'),
  });

  return (
    <DomainListPage<ISaleInvoiceRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      action={
        <Link
          href={`${base}/new`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-background"
        >
          {t('newSale')}
        </Link>
      }
      kpis={[...kpiItems]}
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
        {
          id: 'number',
          header: t('cols.number'),
          cell: (r) => (
            <Link href={`${base}/invoices/${r.id}`} className="text-primary hover:underline">
              {r.number}
            </Link>
          ),
        },
        { id: 'customer', header: t('cols.customer'), cell: (r) => r.customer },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.goldWeight} /> },
        { id: 'amount', header: t('cols.amount'), cell: (r) => <MoneyText value={r.amount} /> },
        {
          id: 'payment',
          header: t('cols.payment'),
          cell: (r) => (
            <StatusBadge
              label={t(`payment.${r.paymentStatus}`)}
              tone={
                r.paymentStatus === 'paid'
                  ? 'success'
                  : r.paymentStatus === 'partial'
                    ? 'warning'
                    : 'danger'
              }
              icon={
                r.paymentStatus === 'paid'
                  ? 'check-read-bold'
                  : r.paymentStatus === 'partial'
                    ? 'scale-bold'
                    : 'danger-triangle-bold'
              }
            />
          ),
        },
        { id: 'seller', header: t('cols.seller'), cell: (r) => r.seller },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge
              label={t(`status.${r.status}`)}
              tone={r.status === 'completed' ? 'gold' : 'neutral'}
              icon={r.status === 'completed' ? 'medal-star-bold' : 'notes-bold'}
            />
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="cart-large-2-bold"
      emptyAccent="bg-success/15 text-success ring-success/25"
      emptyActionLabel={t('newSale')}
      onEmptyAction={() => {
        void navigate(`${base}/new`);
      }}
      footer={
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-secondary">
          <span>
            {tc('total')}: {rows.length}
          </span>
          <div className="flex gap-2">
            <button type="button" className="min-h-9 rounded-md border border-border px-3">
              {tc('prev')}
            </button>
            <button type="button" className="min-h-9 rounded-md border border-border px-3">
              {tc('next')}
            </button>
          </div>
        </div>
      }
    />
  );
}
