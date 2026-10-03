import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'warning';
}

export const PURCHASES_LIST_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'month', labelKey: 'kpi.month', icon: 'delivery-bold', accent: ACCENT.primary },
  { id: 'weight', labelKey: 'kpi.weight', icon: 'scale-bold', accent: ACCENT.info },
  {
    id: 'open',
    labelKey: 'kpi.open',
    icon: 'danger-triangle-bold',
    accent: ACCENT.warning,
    tone: 'warning',
  },
];

export const PURCHASES_RETURNS_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'n', labelKey: 'kpi.returns', icon: 'refresh-bold', accent: ACCENT.warning },
];

export const PURCHASES_LIST_COLUMN_KEYS = [
  'cols.number',
  'cols.supplier',
  'cols.date',
  'cols.weight',
  'cols.amount',
  'cols.payment',
] as const;

export function resolvePurchasesSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}

export function resolvePurchasesColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
