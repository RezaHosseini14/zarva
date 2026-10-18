import type { IconName } from '@/components/ui/icon';

export type ReportCardKey =
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'gold'
  | 'profit'
  | 'dayClose';

export interface IReportKindMeta {
  readonly key: ReportCardKey;
  readonly href: string;
  readonly icon: IconName;
  readonly iconLinear: IconName;
  readonly accent: string;
  readonly stripe: string;
}

export const REPORT_KINDS: ReadonlyArray<IReportKindMeta> = [
  {
    key: 'sales',
    href: '/reports/sales',
    icon: 'cart-large-2-bold',
    iconLinear: 'cart-large-2-linear',
    accent: 'bg-success/15 text-success ring-success/25',
    stripe: 'bg-success',
  },
  {
    key: 'purchases',
    href: '/reports/purchases',
    icon: 'delivery-bold',
    iconLinear: 'delivery-linear',
    accent: 'bg-info/15 text-info ring-info/25',
    stripe: 'bg-info',
  },
  {
    key: 'inventory',
    href: '/reports/inventory',
    icon: 'box-bold',
    iconLinear: 'box-linear',
    accent: 'bg-warning/15 text-warning ring-warning/25',
    stripe: 'bg-warning',
  },
  {
    key: 'gold',
    href: '/reports/gold',
    icon: 'crown-star-bold',
    iconLinear: 'crown-star-linear',
    accent: 'bg-primary/15 text-primary ring-primary/25',
    stripe: 'bg-primary',
  },
  {
    key: 'profit',
    href: '/reports/profit',
    icon: 'graph-up-bold',
    iconLinear: 'graph-up-linear',
    accent: 'bg-primary/15 text-primary ring-primary/25',
    stripe: 'bg-primary',
  },
  {
    key: 'dayClose',
    href: '/reports/day-close',
    icon: 'clipboard-list-bold',
    iconLinear: 'clipboard-list-linear',
    accent: 'bg-success/15 text-success ring-success/25',
    stripe: 'bg-success',
  },
];

export function reportKindMeta(key: string): IReportKindMeta {
  return REPORT_KINDS.find((k) => k.key === key) ?? REPORT_KINDS[0]!;
}
