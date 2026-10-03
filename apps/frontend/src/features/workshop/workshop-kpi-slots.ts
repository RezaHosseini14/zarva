import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
}

export const WORKSHOP_KPI_SLOTS: ReadonlyArray<ISlot> = [
  {
    id: 'open',
    labelKey: 'kpi.open',
    icon: 'settings-minimalistic-bold',
    accent: ACCENT.primary,
  },
  {
    id: 'late',
    labelKey: 'kpi.late',
    icon: 'danger-triangle-bold',
    accent: ACCENT.warning,
  },
];

export const WORKSHOP_COLUMN_KEYS = [
  'cols.order',
  'cols.customer',
  'cols.product',
  'cols.artisan',
  'cols.due',
  'cols.status',
] as const;

export function resolveWorkshopSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot> = WORKSHOP_KPI_SLOTS,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}

export function resolveWorkshopColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string> = WORKSHOP_COLUMN_KEYS,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
