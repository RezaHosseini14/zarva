'use client';

import { useTranslations } from 'next-intl';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type PlatformSessionsTab = 'sessions' | 'history' | 'bans';

interface ITabItem {
  readonly id: PlatformSessionsTab;
  readonly label: string;
  readonly icon: IconName;
}

interface IProps {
  readonly value: PlatformSessionsTab;
  readonly onChange: (tab: PlatformSessionsTab) => void;
  readonly className?: string;
}

/** Same chrome as reports `SubNav` (`zarva-tabs-list` / `zarva-tabs-trigger`). */
export function PlatformSessionsNav({ value, onChange, className }: IProps) {
  const t = useTranslations('platform.sessions');
  const tBans = useTranslations('platform.deviceBans');

  const items: ReadonlyArray<ITabItem> = [
    { id: 'sessions', label: t('activeTab'), icon: 'plug-circle-linear' },
    { id: 'history', label: t('historyTab'), icon: 'clipboard-list-linear' },
    { id: 'bans', label: tBans('title'), icon: 'close-circle-bold' },
  ];

  return (
    <nav data-slot="tabs-list" className={cn('zarva-tabs-list mb-4', className)}>
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            data-slot="tabs-trigger"
            data-active={isActive ? 'true' : undefined}
            className="zarva-tabs-trigger"
            onClick={() => onChange(item.id)}
          >
            <Icon name={item.icon} className="zarva-tabs-trigger-icon" />
            <span className="leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
