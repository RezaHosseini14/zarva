'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { WeightText } from '@/components/business/metrics';
import { goldSummaryToKpiItems } from '@/features/gold/gold-summary-mapper';
import type { IGoldSummary, IGoldTxnRow } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly rows: ReadonlyArray<IGoldTxnRow>;
  readonly summary?: IGoldSummary | null;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

const EMPTY_GOLD_SUMMARY: IGoldSummary = {
  stockGrams: 0,
  txnCount: 0,
  lockedRateToday: false,
};

export function GoldOverviewPage({
  rows,
  summary = null,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.gold');
  const kpiItems = goldSummaryToKpiItems(summary ?? EMPTY_GOLD_SUMMARY, {
    stock: t('kpi.fine'),
    txns: t('kpi.rows'),
    rateLocked: t('kpi.rateLocked'),
    rateOpen: t('kpi.rateOpen'),
  });
  return (
    <DomainListPage<IGoldTxnRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      kpis={[...kpiItems]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'type', header: t('cols.type'), cell: (r) => r.type },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.weight} /> },
        { id: 'purity', header: t('cols.purity'), cell: (r) => r.purity },
        { id: 'fine', header: t('cols.fine'), cell: (r) => <WeightText grams={r.fineGold} /> },
        { id: 'party', header: t('cols.counterparty'), cell: (r) => r.counterparty },
        { id: 'ref', header: t('cols.reference'), cell: (r) => r.reference },
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
