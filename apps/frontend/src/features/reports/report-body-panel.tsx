'use client';

import { useTranslations } from 'next-intl';
import type { IReportDto } from '@zarva/shared';

import { KpiGrid, type IKpiItem } from '@/components/page/kpi-grid';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { ReportHero } from '@/features/reports/report-hero';
import {
  REPORT_KPI_SLOTS,
  reportKpiLabelKey,
} from '@/features/reports/report-kpi-slots';
import { reportKindMeta, type ReportCardKey } from '@/features/reports/report-kinds';
import { ReportSeriesChart } from '@/features/reports/report-series-chart';

interface IProps {
  readonly cardKey: ReportCardKey;
  readonly report: IReportDto;
}

export function ReportBodyPanel({ cardKey, report }: IProps) {
  const t = useTranslations('modules.reports');
  const meta = reportKindMeta(cardKey);
  const period = report.period || t('kpi.thisMonth');
  const kpiItems = buildKpis(t, cardKey, report, meta.accent);

  return (
    <>
      <KpiGrid className="mb-4" items={kpiItems} />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <ReportHero
          total={report.total || '-'}
          period={period}
          icon={meta.icon}
          accent={meta.accent}
        />
        <div className="min-h-[22rem] lg:col-span-2 sm:min-h-[24rem]">
          <DashboardPanel
            title={t('seriesTitle')}
            icon="chart-bold"
            accent="bg-primary/15 text-primary ring-primary/25"
            className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
            headerClassName="shrink-0"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            <ReportSeriesChart series={report.series} />
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}

function buildKpis(
  t: (key: string) => string,
  cardKey: ReportCardKey,
  report: IReportDto,
  accent: string,
): ReadonlyArray<IKpiItem> {
  const byId = new Map(report.kpis.map((k) => [k.id, k.value]));

  return REPORT_KPI_SLOTS[cardKey].map((slot) => {
    let value = byId.get(slot.id);
    if (value === undefined) {
      if (slot.id === 'period') value = report.period || '-';
      else if (slot.id === 'total') value = report.total || '-';
      else value = '-';
    }
    if (!value) value = '-';

    return {
      id: slot.id,
      label: t(reportKpiLabelKey(slot.id)),
      value,
      icon: slot.icon,
      accent,
      tone: slot.tone,
    };
  });
}
