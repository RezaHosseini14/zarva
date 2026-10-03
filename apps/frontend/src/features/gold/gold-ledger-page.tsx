'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { LedgerTable } from '@/components/page/ledger-table';
import { GOLD_LEDGER_KPI_SLOTS } from '@/features/gold/gold-kpi-slots';
import type { ILedgerRow } from '@zarva/shared';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly rows: ReadonlyArray<ILedgerRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function GoldLedgerPage({
  rows,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.gold');
  const opening = rows[0]?.balance ?? '—';
  const closing = rows[rows.length - 1]?.balance ?? '—';
  const isBody = chrome === 'body';

  const body = (
    <>
      {isBody ? null : (
        <PageHeader title={t('nav.ledger')} description={t('ledgerDescription')} />
      )}
      {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
      <KpiGrid
        className="mb-4"
        items={GOLD_LEDGER_KPI_SLOTS.map((slot) => ({
          id: slot.id,
          label: t(slot.labelKey),
          value: slot.id === 'open' ? opening : closing,
          tone: slot.tone,
          icon: slot.icon,
          accent: slot.accent,
        }))}
      />
      <LedgerTable
        rows={[...rows]}
        openingLabel={t('kpi.opening')}
        openingValue={opening}
        closingLabel={t('kpi.closing')}
        closingValue={closing}
        headers={{
          date: t('cols.date'),
          description: t('cols.description'),
          debit: t('cols.debit'),
          credit: t('cols.credit'),
          balance: t('cols.balance'),
        }}
      />
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('nav.ledger')}>{body}</AppShell>;
}
