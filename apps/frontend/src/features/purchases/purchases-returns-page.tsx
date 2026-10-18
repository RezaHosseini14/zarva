'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { MoneyText } from '@/components/business/metrics';
import { PurchasesReturnForm } from '@/features/purchases/purchases-return-form';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IRow {
  readonly id: string;
  readonly number: string;
  readonly purchase: string;
  readonly date: string;
  readonly amount: string;
}

interface IPurchaseOption {
  readonly id: string;
  readonly number: string;
  readonly goldWeight: string;
}

interface IProps {
  readonly rows: ReadonlyArray<IRow>;
  readonly purchases?: ReadonlyArray<IPurchaseOption>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function PurchasesReturnsPage({
  rows,
  purchases = [],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.purchases');
  return (
    <DomainListPage<IRow>
      shellTitle={t('returnsTitle')}
      title={t('returnsTitle')}
      description={t('returnsDescription')}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'n',
          label: t('kpi.returns'),
          value: String(rows.length),
          icon: 'refresh-bold',
          accent: 'bg-warning/15 text-warning ring-warning/25',
        },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <>
          <SubNav
            items={[
              { href: '/purchases', label: t('nav.list') },
              { href: '/purchases/new', label: t('nav.new') },
              { href: '/purchases/returns', label: t('nav.returns') },
            ]}
          />
          <PurchasesReturnForm purchases={purchases} />
        </>
      }
      columns={[
        { id: 'number', header: t('cols.number'), cell: (r) => r.number },
        { id: 'purchase', header: t('cols.purchase'), cell: (r) => r.purchase },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        {
          id: 'amount',
          header: t('cols.amount'),
          cell: (r) => <MoneyText value={r.amount} />,
        },
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
