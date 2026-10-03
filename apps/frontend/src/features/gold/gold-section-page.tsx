'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { WeightText } from '@/components/business/metrics';
import { GOLD_SECTION_KPI_SLOTS } from '@/features/gold/gold-kpi-slots';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

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
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

const NUMERIC_WEIGHT_RE = /^\s*[\d۰-۹٠-٩٫.,]+\s*$/u;

export function GoldSectionPage({
  navKey,
  descriptionKey,
  rows,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.gold');

  return (
    <DomainListPage<IRow>
      shellTitle={t(`nav.${navKey}`)}
      title={t(`nav.${navKey}`)}
      description={t(descriptionKey)}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={GOLD_SECTION_KPI_SLOTS.map((slot) => ({
        id: slot.id,
        label: t(slot.labelKey),
        value: String(rows.length),
        icon: slot.icon,
        accent: slot.accent,
      }))}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.name'), cell: (r) => r.a },
        {
          id: 'b',
          header: t('cols.weight'),
          cell: (r) =>
            NUMERIC_WEIGHT_RE.test(r.b) ? <WeightText grams={r.b.trim()} /> : r.b,
        },
        { id: 'c', header: t('cols.purity'), cell: (r) => r.c },
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
