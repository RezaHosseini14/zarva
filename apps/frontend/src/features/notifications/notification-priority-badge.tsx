'use client';

import { useTranslations } from 'next-intl';
import type { NotificationPriority } from '@zarva/shared';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface IProps {
  readonly priority: NotificationPriority;
  readonly className?: string;
  readonly compact?: boolean;
}

const PRIORITY_ICON: Record<NotificationPriority, IconName> = {
  LOW: 'letter-bold',
  NORMAL: 'bell-bold',
  HIGH: 'bell-bing-bold',
  CRITICAL: 'notification-unread-lines-bold',
};

export function NotificationPriorityBadge({ priority, className, compact }: IProps) {
  const t = useTranslations('modules.notifications.priority');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1',
        `notify-priority-badge notify-priority-${priority.toLowerCase()}`,
        className,
      )}
    >
      <Icon name={PRIORITY_ICON[priority]} className="text-xs" />
      {compact ? null : <span>{t(`${priority.toLowerCase()}.label`)}</span>}
    </span>
  );
}

export function priorityAccentClass(priority: NotificationPriority): string {
  return `notify-priority-accent-${priority.toLowerCase()}`;
}

export function priorityRowClass(priority: NotificationPriority): string {
  return `notify-priority-row-${priority.toLowerCase()}`;
}

export { PRIORITY_ICON };
