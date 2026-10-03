import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'danger';
}

export const INVENTORY_OVERVIEW_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'skus', labelKey: 'kpi.skus', icon: 'box-bold', accent: ACCENT.primary },
  { id: 'value', labelKey: 'kpi.value', icon: 'dollar-bold', accent: ACCENT.success },
  {
    id: 'low',
    labelKey: 'kpi.low',
    icon: 'danger-triangle-bold',
    accent: ACCENT.danger,
    tone: 'danger',
  },
  { id: 'weight', labelKey: 'kpi.weight', icon: 'scale-bold', accent: ACCENT.info },
];

export const INVENTORY_ROWS_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'n', labelKey: 'kpi.rows', icon: 'box-bold', accent: ACCENT.primary },
];

export const INVENTORY_OVERVIEW_COLUMN_KEYS = [
  'cols.name',
  'cols.sku',
  'cols.weight',
  'cols.purity',
  'cols.value',
  'cols.status',
] as const;

export function resolveInventorySkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}

export function resolveInventoryColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
