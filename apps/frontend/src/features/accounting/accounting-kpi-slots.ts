import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly tone?: 'warning' | 'danger' | 'success';
}

export const ACCOUNTING_HUB_KPI_SLOTS: ReadonlyArray<ISlot> = [
  { id: 'cash', labelKey: 'kpi.cash', icon: 'wallet-money-bold', accent: ACCENT.success },
  {
    id: 'ar',
    labelKey: 'kpi.ar',
    icon: 'hand-money-bold',
    accent: ACCENT.warning,
    tone: 'warning',
  },
  {
    id: 'ap',
    labelKey: 'kpi.ap',
    icon: 'bill-list-bold',
    accent: ACCENT.danger,
    tone: 'danger',
  },
  {
    id: 'pl',
    labelKey: 'kpi.pl',
    icon: 'graph-up-bold',
    accent: ACCENT.success,
    tone: 'success',
  },
];

export const ACCOUNTING_ROWS_KPI_SLOTS: ReadonlyArray<ISlot> = [
  {
    id: 'n',
    labelKey: 'kpi.rows',
    icon: 'clipboard-list-bold',
    accent: ACCENT.primary,
  },
];

export const ACCOUNTING_HUB_TILES = [
  {
    hrefKey: '/accounting/rial-ledger',
    titleKey: 'nav.rialLedger',
    descKey: 'hub.rial',
    icon: 'document-text-bold' as const,
    accent: ACCENT.primary,
  },
  {
    hrefKey: '/accounting/cash-bank',
    titleKey: 'nav.cashBank',
    descKey: 'hub.cash',
    icon: 'wallet-money-bold' as const,
    accent: ACCENT.success,
  },
  {
    hrefKey: '/accounting/income',
    titleKey: 'nav.income',
    descKey: 'hub.income',
    icon: 'graph-up-bold' as const,
    accent: ACCENT.success,
  },
  {
    hrefKey: '/accounting/expenses',
    titleKey: 'nav.expenses',
    descKey: 'hub.expenses',
    icon: 'bill-list-bold' as const,
    accent: ACCENT.warning,
  },
  {
    hrefKey: '/accounting/receivables',
    titleKey: 'nav.receivables',
    descKey: 'hub.ar',
    icon: 'hand-money-bold' as const,
    accent: ACCENT.warning,
  },
  {
    hrefKey: '/accounting/payables',
    titleKey: 'nav.payables',
    descKey: 'hub.ap',
    icon: 'card-bold' as const,
    accent: ACCENT.danger,
  },
  {
    hrefKey: '/accounting/transactions',
    titleKey: 'nav.transactions',
    descKey: 'hub.tx',
    icon: 'transfer-horizontal-bold' as const,
    accent: ACCENT.info,
  },
] as const;

export function resolveAccountingSkeletonKpis(
  t: (key: string) => string,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((s) => ({ label: t(s.labelKey), icon: s.icon, accent: s.accent }));
}
