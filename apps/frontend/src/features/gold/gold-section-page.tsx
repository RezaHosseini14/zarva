'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { WeightText } from '@/components/business/metrics';
import { goldSummaryToKpiItems } from '@/features/gold/gold-summary-mapper';
import { GoldRateLockPanel } from '@/features/gold/gold-rate-lock-panel';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import type { IGoldLockedRate, IGoldSummary } from '@zarva/shared';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IProps {
  readonly navKey: string;
  readonly descriptionKey: string;
  readonly rows: ReadonlyArray<IRow>;
  readonly summary?: IGoldSummary | null;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
  readonly todayRate?: IGoldLockedRate | null;
}

const NUMERIC_WEIGHT_RE = /^\s*[\d۰-۹٠-٩٫.,]+\s*$/u;

const EMPTY_GOLD_SUMMARY: IGoldSummary = {
  stockGrams: 0,
  txnCount: 0,
  lockedRateToday: false,
};

export function GoldSectionPage({
  navKey,
  descriptionKey,
  rows,
  summary = null,
  isError,
  errorKind,
  chrome = 'full',
  todayRate = null,
}: IProps) {
  const t = useTranslations('modules.gold');
  const isRates = navKey === 'rates';
  const kpiItems = goldSummaryToKpiItems(summary ?? EMPTY_GOLD_SUMMARY, {
    stock: t('kpi.fine'),
    txns: t('kpi.rows'),
    rateLocked: t('kpi.rateLocked'),
    rateOpen: t('kpi.rateOpen'),
  });

  return (
    <DomainListPage<IRow>
      shellTitle={t(`nav.${navKey}`)}
      title={t(`nav.${navKey}`)}
      description={t(descriptionKey)}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      belowToolbar={isRates ? <GoldRateLockPanel todayRate={todayRate} /> : undefined}
      kpis={[...kpiItems]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.name'), cell: (r) => r.a },
        {
          id: 'b',
          header: isRates ? t('cols.buy') : t('cols.weight'),
          cell: (r) =>
            !isRates && NUMERIC_WEIGHT_RE.test(r.b) ? (
              <WeightText grams={r.b.trim()} />
            ) : (
              r.b
            ),
        },
        {
          id: 'c',
          header: isRates ? t('cols.sell') : t('cols.purity'),
          cell: (r) => r.c,
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="crown-star-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
    />
  );
}
