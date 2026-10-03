'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { IGoldCalculatorResult } from '@zarva/shared';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateGoldAction } from '@/features/gold/gold-actions';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export function GoldCalculatorPage({ chrome = 'full' }: IProps) {
  const t = useTranslations('modules.gold');
  const tCommon = useTranslations('common');
  const [result, setResult] = useState<IGoldCalculatorResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [calcError, setCalcError] = useState(false);
  const isBody = chrome === 'body';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCalcError(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await calculateGoldAction({
        weight: Number(fd.get('weight') ?? 0),
        purity: Number(fd.get('purity') ?? 0),
        rate: Number(fd.get('rate') ?? 0),
        fee: Number(fd.get('fee') ?? 0) || undefined,
      });
      if (res.ok) {
        setResult(res.result);
      } else {
        setCalcError(true);
        setResult(null);
      }
    });
  }

  const body = (
    <>
      {isBody ? null : (
        <PageHeader title={t('nav.calculator')} description={t('calculatorDescription')} />
      )}
      <div className="mb-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
        {t('calculatorDisclaimer')}
      </div>
      <DashboardPanel
        title={t('nav.calculator')}
        icon="calculator-bold"
        accent="bg-primary/15 text-primary ring-primary/25"
        className="mb-4"
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-secondary">{t('cols.weight')}</span>
              <Input name="weight" type="number" step="0.001" min="0.001" placeholder="10.00" required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-secondary">{t('cols.purity')}</span>
              <Input name="purity" type="number" step="0.01" min="0.01" placeholder="0.75" required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-secondary">{t('kpi.rate')}</span>
              <Input name="rate" type="number" min="1" placeholder="68200000" required />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-secondary">{t('cols.fee')}</span>
              <Input name="fee" type="number" min="0" placeholder="0" />
            </label>
          </div>
          {calcError ? (
            <p className="text-sm text-danger" role="alert">
              {tCommon('sectionErrorTitle')}
            </p>
          ) : null}
          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={pending}>
              {t('calculate')}
            </Button>
          </div>
        </form>
      </DashboardPanel>
      <KpiGrid
        items={[
          {
            id: 'total',
            label: t('calculatorResult'),
            value: result?.total ?? '—',
            icon: 'crown-star-bold',
            accent: 'bg-primary/15 text-primary ring-primary/25',
            tone: 'gold',
          },
        ]}
      />
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('nav.calculator')}>{body}</AppShell>;
}
