'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { MoneyText } from '@/components/business/metrics';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface ISimpleRow {
  readonly id: string;
  readonly col1: string;
  readonly col2: string;
  readonly col3: string;
}

interface IProps {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly rows: ReadonlyArray<ISimpleRow>;
  readonly headers?: readonly [string, string, string];
  readonly headerKeys?: readonly [string, string, string];
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function InventorySimpleList({
  titleKey,
  descriptionKey,
  rows,
  headers,
  headerKeys = ['cols.name', 'cols.sku', 'cols.value'],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.inventory');
  const h: readonly [string, string, string] = headers ?? [
    t(headerKeys[0]),
    t(headerKeys[1]),
    t(headerKeys[2]),
  ];
  return (
    <DomainListPage<ISimpleRow>
      shellTitle={t(titleKey)}
      title={t(titleKey)}
      description={t(descriptionKey)}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'n',
          label: t('kpi.rows'),
          value: String(rows.length),
          icon: 'box-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
      ]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'c1', header: h[0], cell: (r) => <MoneyText value={r.col1} /> },
        { id: 'c2', header: h[1], cell: (r) => <MoneyText value={r.col2} /> },
        { id: 'c3', header: h[2], cell: (r) => <MoneyText value={r.col3} /> },
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
