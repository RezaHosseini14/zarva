'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { IAccountingSummary } from '@zarva/shared';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { HubCards } from '@/components/page/hub-cards';
import { SectionLoadError } from '@/components/page/section-load-error';
import { Icon } from '@/components/ui/icon';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly summary: IAccountingSummary;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function AccountingHubPage({
  summary,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.accounting');
  const locale = useLocale();
  const p = (h: string) => `/${locale}${h}`;
  const isBody = chrome === 'body';

  const body = (
    <>
      {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
      {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
      <KpiGrid
        className="mb-6"
        items={[
          {
            id: 'cash',
            label: t('kpi.cash'),
            value: summary.cash,
            icon: 'wallet-money-bold',
            accent: 'bg-success/15 text-success ring-success/25',
          },
          {
            id: 'ar',
            label: t('kpi.ar'),
            value: summary.ar,
            tone: 'warning',
            icon: 'hand-money-bold',
            accent: 'bg-warning/15 text-warning ring-warning/25',
          },
          {
            id: 'ap',
            label: t('kpi.ap'),
            value: summary.ap,
            tone: 'danger',
            icon: 'bill-list-bold',
            accent: 'bg-danger/15 text-danger ring-danger/25',
          },
          {
            id: 'pl',
            label: t('kpi.pl'),
            value: summary.pl,
            tone: 'success',
            icon: 'graph-up-bold',
            accent: 'bg-success/15 text-success ring-success/25',
          },
        ]}
      />
      <HubCards
        items={[
          {
            href: p('/accounting/rial-ledger'),
            title: t('nav.rialLedger'),
            description: t('hub.rial'),
            icon: <Icon name="document-text-bold" className="text-lg" />,
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
          {
            href: p('/accounting/cash-bank'),
            title: t('nav.cashBank'),
            description: t('hub.cash'),
            icon: <Icon name="wallet-money-bold" className="text-lg" />,
            accent: 'bg-success/15 text-success ring-success/25',
          },
          {
            href: p('/accounting/income'),
            title: t('nav.income'),
            description: t('hub.income'),
            icon: <Icon name="graph-up-bold" className="text-lg" />,
            accent: 'bg-success/15 text-success ring-success/25',
          },
          {
            href: p('/accounting/expenses'),
            title: t('nav.expenses'),
            description: t('hub.expenses'),
            icon: <Icon name="bill-list-bold" className="text-lg" />,
            accent: 'bg-warning/15 text-warning ring-warning/25',
          },
          {
            href: p('/accounting/receivables'),
            title: t('nav.receivables'),
            description: t('hub.ar'),
            icon: <Icon name="hand-money-bold" className="text-lg" />,
            accent: 'bg-warning/15 text-warning ring-warning/25',
          },
          {
            href: p('/accounting/payables'),
            title: t('nav.payables'),
            description: t('hub.ap'),
            icon: <Icon name="card-bold" className="text-lg" />,
            accent: 'bg-danger/15 text-danger ring-danger/25',
          },
          {
            href: p('/accounting/transactions'),
            title: t('nav.transactions'),
            description: t('hub.tx'),
            icon: <Icon name="transfer-horizontal-bold" className="text-lg" />,
            accent: 'bg-info/15 text-info ring-info/25',
          },
        ]}
      />
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('title')}>{body}</AppShell>;
}
