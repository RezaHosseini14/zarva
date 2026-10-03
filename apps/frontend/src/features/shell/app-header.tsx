'use client';

import { SidebarMenuButton } from './app-sidebar';
import { HeaderBreadcrumb } from './header-breadcrumb';
import { HeaderLiveRates } from './header-live-rates';
import { HeaderQuickCreate } from './header-quick-create';
import { HeaderSearchButton } from './header-search-button';
import { NotificationsBell } from '@/features/notifications/notifications-bell';

interface IAppHeaderProps {
  readonly title: string;
  readonly onMenuClick: () => void;
}

export function AppHeader({ title, onMenuClick }: IAppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 px-1 sm:px-2">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarMenuButton onClick={onMenuClick} />
        <HeaderBreadcrumb title={title} />
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <HeaderQuickCreate />
        <HeaderSearchButton />
        <HeaderLiveRates />
        <NotificationsBell />
      </div>
    </header>
  );
}
