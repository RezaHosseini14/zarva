import type { IconName } from '@/components/ui/icon';

export interface INavItem {
  readonly href: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly subject?: string;
  readonly module?: string;
}

export const PRIMARY_NAV: ReadonlyArray<INavItem> = [
  {
    href: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: 'widget-2-bold',
    subject: 'Dashboard',
    module: 'dashboard',
  },
];
