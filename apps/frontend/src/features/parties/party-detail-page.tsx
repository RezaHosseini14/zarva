'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import { KpiGrid } from '@/components/page/kpi-grid';
import { Button } from '@/components/ui/button';
import type { IPartyRow } from '@zarva/shared';

interface IProps {
  readonly kind: 'customers' | 'suppliers';
  readonly party: IPartyRow;
  readonly chrome?: 'full' | 'body';
}

export function PartyDetailPage({ kind, party, chrome = 'full' }: IProps) {
  const t = useTranslations(`modules.${kind}`);
  const locale = useLocale();
  const base = kind === 'customers' ? '/customers' : '/suppliers';
  const balanceHref = kind === 'customers' ? `${base}/receivables` : `${base}/payables`;
  const isBody = chrome === 'body';

  const body = (
    <>
      <PageHeader
        title={party.name}
        description={party.contact}
        action={
          <Button variant="ghost" asChild>
            <Link href={`/${locale}${base}`}>{t('nav.list')}</Link>
          </Button>
        }
      />
      <SubNav
        items={[
          { href: `${base}/${party.id}`, label: t('nav.profile') },
          { href: balanceHref, label: t('nav.balances') },
        ]}
      />
      <KpiGrid
        className="mt-4"
        items={[
          {
            id: 'balance',
            label: t('cols.balance'),
            value: party.balance,
            icon: 'wallet-money-bold',
            accent: 'bg-warning/15 text-warning ring-warning/25',
            tone: 'warning',
          },
          {
            id: 'total',
            label: t('cols.total'),
            value: party.total,
            icon: 'hand-money-bold',
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
          {
            id: 'lastTxn',
            label: t('cols.lastTxn'),
            value: party.lastTxn,
            icon: 'clipboard-list-bold',
            accent: 'bg-info/15 text-info ring-info/25',
          },
        ]}
      />
    </>
  );

  if (isBody) return body;
  return <AppShell title={party.name}>{body}</AppShell>;
}
