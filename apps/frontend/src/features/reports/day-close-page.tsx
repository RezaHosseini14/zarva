'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { businessDateKey } from '@zarva/shared';

import { PageHeader } from '@/components/page/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppShell } from '@/features/shell/app-shell';
import {
  getDayCloseAction,
  reopenDayCloseAction,
  signOffDayCloseAction,
} from '@/features/reports/day-close-actions';
import type { IDayCloseSummary } from '@zarva/shared';

interface IProps {
  readonly initial: IDayCloseSummary | null;
  readonly chrome?: 'full' | 'body';
}

export function DayClosePage({ initial, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.reports');
  const router = useRouter();
  const [summary, setSummary] = useState(initial);
  const [date, setDate] = useState(
    initial?.businessDate ?? businessDateKey(),
  );
  const [filter, setFilter] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload(nextDate: string) {
    startTransition(async () => {
      const data = await getDayCloseAction(nextDate || undefined);
      setSummary(data);
    });
  }

  function handleSignOff() {
    setError(null);
    startTransition(async () => {
      const res = await signOffDayCloseAction(date || undefined);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSummary(res.summary);
      router.refresh();
    });
  }

  function handleReopen() {
    setError(null);
    if (reopenReason.trim().length < 3) {
      setError(t('dayCloseReopenReasonRequired'));
      return;
    }
    startTransition(async () => {
      const res = await reopenDayCloseAction(date || undefined, reopenReason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSummary(res.summary);
      setReopenReason('');
      router.refresh();
    });
  }

  const metal = (summary?.metal ?? []).filter((m) =>
    filter
      ? String(m.purityKarat).includes(filter) ||
        String(m.closingGrams).includes(filter)
      : true,
  );

  const body = (
    <>
      {chrome === 'body' ? null : (
        <PageHeader
          title={t('dayCloseTitle')}
          description={t('dayCloseDescription')}
        />
      )}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('dayCloseDate')}</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              reload(e.target.value);
            }}
            className="zarva-num"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('dayCloseFilter')}</span>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('dayCloseFilterPh')}
          />
        </label>
        <Button
          type="button"
          variant="primary"
          disabled={pending || Boolean(summary?.closedAt)}
          onClick={handleSignOff}
        >
          {summary?.closedAt ? t('dayCloseSigned') : t('dayCloseSignOff')}
        </Button>
      </div>
      {summary?.closedAt ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-nested/70 p-3 ring-1 ring-border/50">
          <p className="w-full text-xs text-secondary">
            {t('dayCloseFrozenHint')}
          </p>
          <label className="min-w-[12rem] flex-1 space-y-1.5 text-sm">
            <span className="text-secondary">{t('dayCloseReopenReason')}</span>
            <Input
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={handleReopen}
          >
            {t('dayCloseReopen')}
          </Button>
        </div>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {!summary ? (
        <p className="text-sm text-muted-fg">{t('dayCloseEmpty')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={t('dayCloseSales')} value={String(summary.salesCount)} />
          <Stat
            label={t('dayCloseBuybacks')}
            value={String(summary.buybacksCount)}
          />
          <Stat
            label={t('dayClosePurchases')}
            value={String(summary.purchasesCount)}
          />
          <Stat label={t('dayCloseCashIn')} value={String(summary.cashInIrt)} />
          <Stat
            label={t('dayCloseCashOut')}
            value={String(summary.cashOutIrt)}
          />
          <Stat
            label={t('dayCloseSalesAmount')}
            value={String(summary.salesAmountIrt)}
          />
          {metal.map((m) => (
            <Stat
              key={m.purityKarat}
              label={t('dayCloseMetal', { karat: m.purityKarat })}
              value={`${m.closingGrams}g (in ${m.gramsIn} / out ${m.gramsOut})`}
            />
          ))}
        </div>
      )}
    </>
  );

  if (chrome === 'body') return body;
  return <AppShell title={t('dayCloseTitle')}>{body}</AppShell>;
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-xl bg-nested/70 p-3.5 ring-1 ring-border/50">
      <p className="text-xs text-secondary">{label}</p>
      <p className="zarva-num mt-1.5 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
