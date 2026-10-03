'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import type { IInventoryRow } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly rows?: ReadonlyArray<IInventoryRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function InventoryOverviewPage({
  rows = [],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.inventory');
  const locale = useLocale();

  return (
    <DomainListPage<IInventoryRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      action={
        <Link
          href={`/${locale}/inventory/products`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-background"
        >
          {t('nav.products')}
        </Link>
      }
      kpis={[
        {
          id: 'skus',
          label: t('kpi.skus'),
          value: String(rows.length),
          icon: 'box-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
        {
          id: 'value',
          label: t('kpi.value'),
          value: rows[0]?.value ?? '—',
          icon: 'dollar-bold',
          accent: 'bg-success/15 text-success ring-success/25',
        },
        {
          id: 'low',
          label: t('kpi.low'),
          value: String(rows.filter((r) => r.status === 'low').length),
          tone: 'danger',
          icon: 'danger-triangle-bold',
          accent: 'bg-danger/15 text-danger ring-danger/25',
        },
        {
          id: 'weight',
          label: t('kpi.weight'),
          value: rows[0]?.weight ?? '—',
          icon: 'scale-bold',
          accent: 'bg-info/15 text-info ring-info/25',
        },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/inventory', label: t('nav.overview') },
            { href: '/inventory/products', label: t('nav.products') },
            { href: '/inventory/movements', label: t('nav.movements') },
            { href: '/inventory/warehouses', label: t('nav.warehouses') },
            { href: '/inventory/low-stock', label: t('nav.lowStock') },
            { href: '/inventory/valuation', label: t('nav.valuation') },
            { href: '/inventory/adjustments', label: t('nav.adjustments') },
            { href: '/inventory/barcodes', label: t('nav.barcodes') },
          ]}
        />
      }
      columns={[
        {
          id: 'name',
          header: t('cols.name'),
          cell: (r) => (
            <Link
              href={`/${locale}/inventory/products/${r.id}`}
              className="text-primary hover:underline"
            >
              {r.name}
            </Link>
          ),
        },
        { id: 'sku', header: t('cols.sku'), cell: (r) => r.sku },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.weight} /> },
        { id: 'purity', header: t('cols.purity'), cell: (r) => r.purity },
        { id: 'qty', header: t('cols.qty'), cell: (r) => r.qty },
        { id: 'location', header: t('cols.location'), cell: (r) => r.location },
        { id: 'value', header: t('cols.value'), cell: (r) => <MoneyText value={r.value} /> },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge
              label={t(`status.${r.status}`)}
              tone={r.status === 'low' ? 'danger' : r.status === 'available' ? 'success' : 'warning'}
              icon={
                r.status === 'low'
                  ? 'danger-triangle-bold'
                  : r.status === 'available'
                    ? 'check-read-bold'
                    : 'box-bold'
              }
            />
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="box-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
    />
  );
}
