import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface IGoldKpiSlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'default' | 'gold' | 'warning' | 'danger' | 'success';
}

export const GOLD_OVERVIEW_KPI_SLOTS: ReadonlyArray<IGoldKpiSlot> = [
  {
    id: 'count',
    labelKey: 'kpi.fine',
    icon: 'crown-star-bold',
    accent: ACCENT.primary,
    tone: 'gold',
  },
];

export const GOLD_SECTION_KPI_SLOTS: ReadonlyArray<IGoldKpiSlot> = [
  {
    id: 'n',
    labelKey: 'kpi.rows',
    icon: 'crown-star-bold',
    accent: ACCENT.primary,
  },
];

export const GOLD_LEDGER_KPI_SLOTS: ReadonlyArray<IGoldKpiSlot> = [
  {
    id: 'open',
    labelKey: 'kpi.opening',
    icon: 'crown-bold',
    accent: ACCENT.primary,
  },
  {
    id: 'close',
    labelKey: 'kpi.closing',
    icon: 'crown-star-bold',
    accent: ACCENT.primaryStrong,
    tone: 'gold',
  },
];

export const GOLD_OVERVIEW_COLUMN_KEYS = [
  'cols.date',
  'cols.type',
  'cols.weight',
  'cols.purity',
  'cols.fine',
  'cols.counterparty',
  'cols.reference',
] as const;

export const GOLD_SECTION_COLUMN_KEYS = ['cols.name', 'cols.weight', 'cols.purity'] as const;

export const GOLD_LEDGER_COLUMN_KEYS = [
  'cols.date',
  'cols.description',
  'cols.debit',
  'cols.credit',
  'cols.balance',
] as const;

export const GOLD_CALC_FIELD_KEYS = [
  'cols.weight',
  'cols.purity',
  'kpi.rate',
  'cols.fee',
] as const;

export function resolveGoldSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<IGoldKpiSlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({
    label: t(s.labelKey),
    icon: s.icon,
    accent: s.accent,
  }));
}

export function resolveGoldColumnHeaders(
  t: (key: string) => string,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((k) => t(k));
}
