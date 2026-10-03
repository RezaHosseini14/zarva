import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'warning';
}

export function partiesListKpiSlots(kind: 'customers' | 'suppliers'): ReadonlyArray<ISlot> {
  return [
    {
      id: 'count',
      labelKey: 'kpi.count',
      icon: kind === 'customers' ? 'users-group-rounded-bold' : 'delivery-bold',
      accent: ACCENT.info,
    },
    {
      id: 'balance',
      labelKey: 'kpi.balance',
      icon: 'wallet-money-bold',
      accent: ACCENT.warning,
      tone: 'warning',
    },
    {
      id: 'total',
      labelKey: 'kpi.total',
      icon: 'hand-money-bold',
      accent: ACCENT.primary,
    },
  ];
}

export const PARTIES_COLUMN_KEYS = [
  'cols.name',
  'cols.contact',
  'cols.balance',
  'cols.total',
  'cols.lastTxn',
] as const;

export function resolvePartiesSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}

export function resolvePartiesColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
