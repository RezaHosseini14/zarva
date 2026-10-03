'use client';

import { useTranslations } from 'next-intl';
import type { NotificationPriority } from '@zarva/shared';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface INotificationTitleCellProps {
  readonly title: string;
  readonly body: string;
  readonly priority: NotificationPriority;
  readonly unread?: boolean;
  readonly onClick: () => void;
}

const TILE: Record<NotificationPriority, string> = {
  LOW: 'bg-muted/80 text-secondary ring-border/60',
  NORMAL: 'bg-primary/12 text-primary ring-primary/25',
  HIGH: 'bg-warning/12 text-warning ring-warning/30',
  CRITICAL: 'bg-danger/12 text-danger ring-danger/30',
};

const CHIP: Record<NotificationPriority, string> = {
  LOW: 'bg-muted/70 text-secondary ring-border/50',
  NORMAL: 'bg-primary/10 text-primary ring-primary/25',
  HIGH: 'bg-warning/12 text-warning ring-warning/30',
  CRITICAL: 'bg-danger/12 text-danger ring-danger/30',
};

function rowIcon(unread: boolean, priority: NotificationPriority): IconName {
  if (priority === 'CRITICAL') return 'notification-unread-lines-bold';
  if (priority === 'HIGH') return 'bell-bing-bold';
  return unread ? 'inbox-in-bold' : 'letter-bold';
}

/** Primary alert column — icon tile, title + priority label, body. */
export function NotificationTitleCell({
  title,
  body,
  priority,
  unread = false,
  onClick,
}: INotificationTitleCellProps) {
  const t = useTranslations('modules.notifications.priority');
  const priorityKey = priority.toLowerCase() as 'low' | 'normal' | 'high' | 'critical';

  return (
    <button
      type="button"
      className={cn(
        'group flex w-full min-w-0 items-center gap-3 rounded-xl px-2 py-2 text-start',
        'transition-colors duration-150',
        'hover:bg-hover/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        unread && 'bg-primary/4',
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          'relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl ring-1',
          TILE[priority],
        )}
      >
        <Icon name={rowIcon(unread, priority)} className="text-lg" />
        {unread ? (
          <span
            className="absolute -inset-e-0.5 -top-0.5 size-2.5 rounded-full bg-warning ring-2 ring-background"
            aria-hidden
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'min-w-0 truncate text-sm tracking-tight text-foreground',
              unread ? 'font-semibold' : 'font-medium',
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5',
              'text-[10px] font-semibold leading-none ring-1',
              CHIP[priority],
            )}
          >
            {t(`${priorityKey}.label`)}
          </span>
        </span>
        <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-secondary group-hover:text-foreground/70">
          {body}
        </span>
      </span>
    </button>
  );
}
