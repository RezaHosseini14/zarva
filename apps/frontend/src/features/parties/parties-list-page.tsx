'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText } from '@/components/business/metrics';
import type { IPartyRow } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly kind: 'customers' | 'suppliers';
  readonly rows: ReadonlyArray<IPartyRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function PartiesListPage({
  kind,
  rows,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations(`modules.${kind}`);
  const locale = useLocale();
  const base = kind === 'customers' ? '/customers' : '/suppliers';

  return (
    <DomainListPage<IPartyRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'count',
          label: t('kpi.count'),
          value: String(rows.length),
          icon: kind === 'customers' ? 'users-group-rounded-bold' : 'delivery-bold',
          accent: 'bg-info/15 text-info ring-info/25',
        },
        {
          id: 'balance',
          label: t('kpi.balance'),
          value: rows[0]?.balance ?? '۰',
          tone: 'warning',
          icon: 'wallet-money-bold',
          accent: 'bg-warning/15 text-warning ring-warning/25',
        },
        {
          id: 'total',
          label: t('kpi.total'),
          value: '—',
          icon: 'hand-money-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
      ]}
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
