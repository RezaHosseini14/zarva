'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { LedgerTable } from '@/components/page/ledger-table';
import { Input } from '@/components/ui/input';
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
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.date.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle) ||
        r.debit.toLowerCase().includes(needle) ||
        r.credit.toLowerCase().includes(needle),
    );
  }, [rows, q]);
  const opening = filtered[0]?.balance ?? rows[0]?.balance ?? '—';
  const closing =
    filtered[filtered.length - 1]?.balance ??
    rows[rows.length - 1]?.balance ??
    '—';
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
      <div className="mb-3 max-w-sm">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search')}
          aria-label={t('search')}
        />
      </div>
      <LedgerTable
        rows={[...filtered]}
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
