import { getTranslations } from 'next-intl/server';
import type { IReportDto } from '@zarva/shared';

import { ErrorState } from '@/components/page/error-state';
import { ReportBodyPanel } from '@/features/reports/report-body-panel';
import { getReport, type ReportKind } from '@/features/reports/get-reports-data';

const EMPTY_REPORT: IReportDto = {
  period: '-',
  total: '-',
  kpis: [],
  series: [],
};

interface IProps {
  readonly cardKey: ReportKind;
}

export async function ReportBodySection({ cardKey }: IProps) {
  const t = await getTranslations('modules.reports');

  let report: IReportDto = EMPTY_REPORT;
  let loadFailed = false;

  try {
    report = await getReport(cardKey);
  } catch {
    loadFailed = true;
  }

  return (
    <>
      {loadFailed ? (
        <ErrorState
          className="mb-4"
          title={t('bodyErrorTitle')}
          description={t('bodyErrorDescription')}
        />
      ) : null}
      <ReportBodyPanel cardKey={cardKey} report={report} />
    </>
  );
}
