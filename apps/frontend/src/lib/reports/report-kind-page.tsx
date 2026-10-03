import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageHeader } from '@/components/page/page-header';
import { ReportBodySection } from '@/features/reports/report-body-section';
import type { ReportKind } from '@/features/reports/get-reports-data';
import {
  REPORT_KPI_SLOTS,
  reportKpiLabelKey,
} from '@/features/reports/report-kpi-slots';
import { reportKindMeta } from '@/features/reports/report-kinds';
import { ReportNav } from '@/features/reports/report-nav';
import { ReportBodySkeleton } from '@/features/reports/report-skeletons';
import { AppShell } from '@/features/shell/app-shell';

interface IProps {
  readonly locale: string;
  readonly cardKey: ReportKind;
}

export async function renderReportKindPage({ locale, cardKey }: IProps) {
  setRequestLocale(locale);
  const t = await getTranslations('modules.reports');
  const meta = reportKindMeta(cardKey);
  const title = t(`cards.${cardKey}`);
  const description = t(`cards.${cardKey}Desc`);
  const slots = REPORT_KPI_SLOTS[cardKey];

  const skeletonCopy = {
    seriesTitle: t('seriesTitle'),
    summaryLabel: t('summaryLabel'),
    kpiSlots: slots.map((slot) => ({
      label: t(reportKpiLabelKey(slot.id)),
      icon: slot.icon,
    })),
  };

  return (
    <AppShell title={title}>
      <PageHeader title={title} description={description} />
      <ReportNav />
      <Suspense
        fallback={
          <ReportBodySkeleton
            copy={skeletonCopy}
            accent={meta.accent}
            icon={meta.icon}
          />
        }
      >
        <ReportBodySection cardKey={cardKey} />
      </Suspense>
    </AppShell>
  );
}
