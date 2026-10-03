import type { IconName } from '@/components/ui/icon';

/** Resolved KPI slot for list/hub skeletons — labels are i18n strings already. */
export interface ISkeletonKpi {
  readonly label: string;
  readonly icon: IconName;
  readonly accent: string;
}

export const ACCENT = {
  primary: 'bg-primary/15 text-primary ring-primary/25',
  primaryStrong: 'bg-primary/20 text-accent ring-primary/30',
  success: 'bg-success/15 text-success ring-success/25',
  info: 'bg-info/15 text-info ring-info/25',
  warning: 'bg-warning/15 text-warning ring-warning/25',
  danger: 'bg-danger/15 text-danger ring-danger/25',
} as const;
