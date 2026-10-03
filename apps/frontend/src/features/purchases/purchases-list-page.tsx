'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import type { IPurchaseRow } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly rows?: ReadonlyArray<IPurchaseRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function PurchasesListPage({
  rows = [],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.purchases');
  const locale = useLocale();
  const base = `/${locale}/purchases`;

  return (
    <DomainListPage<IPurchaseRow>
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
          {t('newPurchase')}
        </Link>
      }
      kpis={[
        {
          id: 'month',
          label: t('kpi.month'),
          value: rows[0]?.amount ?? '—',
          icon: 'delivery-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
        {
          id: 'weight',
          label: t('kpi.weight'),
          value: rows[0]?.goldWeight ?? '—',
          icon: 'scale-bold',
          accent: 'bg-info/15 text-info ring-info/25',
        },
        {
          id: 'open',
          label: t('kpi.open'),
          value: String(rows.filter((r) => r.paymentStatus !== 'paid').length),
          tone: 'warning',
          icon: 'danger-triangle-bold',
          accent: 'bg-warning/15 text-warning ring-warning/25',
        },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/purchases', label: t('nav.list') },
            { href: '/purchases/new', label: t('nav.new') },
            { href: '/purchases/returns', label: t('nav.returns') },
          ]}
        />
      }
      columns={[
        {
          id: 'number',
          header: t('cols.number'),
          cell: (r) => (
            <Link href={`${base}/${r.id}`} className="text-primary hover:underline">
              {r.number}
            </Link>
          ),
        },
        { id: 'supplier', header: t('cols.supplier'), cell: (r) => r.supplier },
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
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="delivery-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
    />
  );
}
