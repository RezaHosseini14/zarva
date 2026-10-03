'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { canAccessSubject } from '@zarva/shared';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { useAppAbility, useAuth } from '@/features/auth/auth-provider';
import { HeaderActionTooltip } from '@/features/shell/header-action-tooltip';
import { EmptyState } from '@/components/page/empty-state';
import { ErrorState } from '@/components/page/error-state';
import {
  useNotificationMutations,
  useNotificationsInbox,
  useNotificationsUnreadCount,
} from './use-notifications';
import { NotificationPriorityBadge } from './notification-priority-badge';

function formatNotificationTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 45) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' }).format(
      0,
      'second',
    );
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' });

  if (absSec < 3600) {
    return rtf.format(Math.round(diffSec / 60), 'minute');
  }
  if (absSec < 86_400) {
    return rtf.format(Math.round(diffSec / 3600), 'hour');
  }
  if (absSec < 86_400 * 7) {
    return rtf.format(Math.round(diffSec / 86_400), 'day');
  }

  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function badgeLabel(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

export function NotificationsBell() {
  const t = useTranslations('modules.notifications');
  const tHeader = useTranslations('shell.header');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const ability = useAppAbility();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const unreadQ = useNotificationsUnreadCount();
  const inboxQ = useNotificationsInbox(10);
  const { markRead, markAllRead } = useNotificationMutations();

  if (!user || !canAccessSubject(ability, 'Notification')) {
    return null;
  }

  const count = unreadQ.data?.count ?? 0;
  const items = inboxQ.data?.items ?? [];
  const contentDir = locale === 'en' ? 'ltr' : 'rtl';
  const isError = inboxQ.isError || unreadQ.isError;

  return (
    <HeaderActionTooltip label={tHeader('notificationsTooltip')} disabled={open}>
      <span className="inline-flex">
        <DropdownMenu dir="ltr" modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="zarva-header-action"
              aria-label={t('bellAria', { count })}
              data-unread={count > 0 ? 'true' : undefined}
            >
              <Icon
                name={count > 0 ? 'bell-bold' : 'bell-linear'}
                className="zarva-header-action__icon text-[1.25rem]"
              />
              {count > 0 ? (
                <span className="zarva-header-action__badge" aria-hidden>
                  {badgeLabel(count)}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            className="w-[min(100vw-1.5rem,22rem)] min-w-[18rem] p-0"
          >
            <div dir={contentDir} className="overflow-hidden rounded-[inherit]">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">{t('title')}</p>
                {count > 0 ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => markAllRead.mutate()}
                  >
                    {t('markAllRead')}
                  </button>
                ) : null}
              </div>
              <div className="max-h-80 overflow-y-auto zarva-scrollbar">
                {isError ? (
                  <ErrorState
                    compact
                    title={t('errors.loadInbox')}
                    description={tCommon('sectionErrorDescription')}
                    retryLabel={tCommon('retry')}
                    onRetry={() => {
                      void inboxQ.refetch();
                      void unreadQ.refetch();
                    }}
                  />
                ) : items.length === 0 ? (
                  <EmptyState
                    icon="bell-bold"
                    accent="bg-primary/15 text-primary ring-primary/25"
                    title={t('emptyTitle')}
                    description={t('emptyDescription')}
                    className="py-8"
                  />
                ) : (
                  items.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="mx-1 my-0.5 cursor-pointer items-start gap-2 px-3 py-2.5"
                      onSelect={(e) => {
                        e.preventDefault();
                        if (item.isUnread) markRead.mutate(item.id);
                      }}
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isUnread ? 'bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_55%,transparent)]' : 'bg-transparent'}`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          <time
                            dateTime={item.createdAt}
                            className="shrink-0 pt-0.5 text-[11px] leading-none tabular-nums text-muted-fg"
                          >
                            {formatNotificationTime(item.createdAt, locale)}
                          </time>
                        </span>
                        {(item.priority === 'HIGH' || item.priority === 'CRITICAL') && (
                          <span className="mt-1 inline-block">
                            <NotificationPriorityBadge priority={item.priority} />
                          </span>
                        )}
                        <span className="mt-0.5 line-clamp-2 text-xs text-secondary">{item.body}</span>
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator className="my-0" />
              <div className="p-2">
                <DropdownMenuItem asChild className="cursor-pointer justify-center py-2.5">
                  <Link href={`/${locale}/notifications`} className="font-medium text-primary">
                    {t('viewAll')}
                  </Link>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </HeaderActionTooltip>
  );
}
