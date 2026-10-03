'use client';

import { useLocale } from 'next-intl';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface INotificationTimeCellProps {
  readonly iso: string;
}

interface ITimeParts {
  readonly primary: string;
  readonly secondary: string;
  readonly title: string;
  readonly isRecent: boolean;
}

function splitTime(iso: string, locale: string): ITimeParts {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { primary: iso, secondary: '', title: iso, isRecent: false };
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dayFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const fullFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const clock = timeFmt.format(date);
  const title = fullFmt.format(date);

  if (diffSec < 60) {
    return {
      primary: clock,
      secondary: relative.format(0, 'minute'),
      title,
      isRecent: true,
    };
  }
  if (diffMin < 60) {
    return {
      primary: clock,
      secondary: relative.format(-diffMin, 'minute'),
      title,
      isRecent: true,
    };
  }
  if (diffHour < 24) {
    return {
      primary: clock,
      secondary: relative.format(-diffHour, 'hour'),
      title,
      isRecent: diffHour < 6,
    };
  }
  if (diffDay < 7) {
    return {
      primary: dayFmt.format(date),
      secondary: `${clock} · ${relative.format(-diffDay, 'day')}`,
      title,
      isRecent: false,
    };
  }

  return {
    primary: dayFmt.format(date),
    secondary: clock,
    title,
    isRecent: false,
  };
}

/** Two-line time: clock/date + relative detail. */
export function NotificationTimeCell({ iso }: INotificationTimeCellProps) {
  const locale = useLocale();
  const parts = splitTime(iso, locale);

  return (
    <time
      dateTime={iso}
      title={parts.title}
      className="inline-flex items-center gap-2 whitespace-nowrap"
    >
      <span
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
          parts.isRecent
            ? 'bg-info/12 text-info ring-info/25'
            : 'bg-muted/80 text-secondary ring-border/60',
        )}
      >
        <Icon
          name={parts.isRecent ? 'clock-circle-bold' : 'calendar-date-bold'}
          className="text-sm"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 text-start">
        <span className="zarva-num text-xs font-semibold leading-none text-foreground">
          {parts.primary}
        </span>
        {parts.secondary ? (
          <span className="zarva-num text-[11px] leading-none text-muted-fg">
            {parts.secondary}
          </span>
        ) : null}
      </span>
    </time>
  );
}
