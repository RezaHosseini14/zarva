import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'warning' | 'success' | 'default';
}

export const SALES_LIST_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'today', labelKey: 'kpi.today', icon: 'cart-large-2-bold', accent: ACCENT.success },
  { id: 'count', labelKey: 'kpi.count', icon: 'document-text-bold', accent: ACCENT.info },
  { id: 'avg', labelKey: 'kpi.avg', icon: 'chart-bold', accent: ACCENT.primary },
  {
    id: 'unpaid',
    labelKey: 'kpi.unpaid',
    icon: 'danger-triangle-bold',
    accent: ACCENT.warning,
    tone: 'warning',
  },
];

export const SALES_RETURNS_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'count', labelKey: 'kpi.returns', icon: 'refresh-bold', accent: ACCENT.warning },
  { id: 'value', labelKey: 'kpi.returnValue', icon: 'hand-money-bold', accent: ACCENT.primary },
];

export const SALES_PAYMENTS_KPI_SLOTS: ReadonlyArray<ISlot> = [
  {
    id: 'today',
    labelKey: 'kpi.paymentsToday',
    icon: 'card-bold',
    accent: ACCENT.success,
  },
  {
    id: 'pending',
    labelKey: 'kpi.pending',
    icon: 'clipboard-list-bold',
    accent: ACCENT.warning,
  },
];

export const SALES_LIST_COLUMN_KEYS = [
  'cols.number',
  'cols.customer',
  'cols.date',
  'cols.weight',
  'cols.amount',
  'cols.status',
  'cols.payment',
] as const;

export function resolveSalesSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}

export function resolveSalesColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
