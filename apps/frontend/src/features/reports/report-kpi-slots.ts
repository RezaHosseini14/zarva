import type { IKpiItem } from '@/components/page/kpi-grid';
import type { IconName } from '@/components/ui/icon';
import type { ReportCardKey } from '@/features/reports/report-kinds';

export type ReportKpiSlotId =
  | 'count'
  | 'paid'
  | 'skus'
  | 'low'
  | 'txns'
  | 'sales'
  | 'cogs'
  | 'period'
  | 'total';

interface IReportKpiSlot {
  readonly id: ReportKpiSlotId;
  readonly icon: IconName;
  readonly tone?: IKpiItem['tone'];
}

/** Always four tiles — matches loading skeleton; missing API values show "—". */
export const REPORT_KPI_SLOTS: Record<
  ReportCardKey,
  readonly [IReportKpiSlot, IReportKpiSlot, IReportKpiSlot, IReportKpiSlot]
> = {
  sales: [
    { id: 'count', icon: 'document-text-bold' },
    { id: 'paid', icon: 'card-bold', tone: 'success' },
    { id: 'period', icon: 'clipboard-list-bold' },
    { id: 'total', icon: 'cart-large-2-bold', tone: 'gold' },
  ],
  purchases: [
    { id: 'count', icon: 'document-text-bold' },
    { id: 'period', icon: 'clipboard-list-bold' },
    { id: 'total', icon: 'delivery-bold', tone: 'gold' },
    { id: 'paid', icon: 'card-bold', tone: 'success' },
  ],
  inventory: [
    { id: 'skus', icon: 'box-bold' },
    { id: 'low', icon: 'danger-triangle-bold', tone: 'warning' },
    { id: 'period', icon: 'clipboard-list-bold' },
    { id: 'total', icon: 'box-bold', tone: 'gold' },
  ],
  gold: [
    { id: 'txns', icon: 'transfer-horizontal-bold' },
    { id: 'period', icon: 'clipboard-list-bold' },
    { id: 'total', icon: 'crown-star-bold', tone: 'gold' },
    { id: 'count', icon: 'document-text-bold' },
  ],
  profit: [
    { id: 'sales', icon: 'cart-large-2-bold' },
    { id: 'cogs', icon: 'delivery-bold' },
    { id: 'period', icon: 'clipboard-list-bold' },
    { id: 'total', icon: 'graph-up-bold', tone: 'gold' },
  ],
};

export function reportKpiLabelKey(id: ReportKpiSlotId): string {
  if (id === 'period' || id === 'total') return `kpi.${id}`;
  return `kpiLabels.${id}`;
}
