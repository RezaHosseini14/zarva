'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  INotificationInboxItem,
  INotificationSentItem,
  INotificationUnreadCount,
  IPaginatedResult,
} from '@zarva/shared';

import { KpiGrid } from '@/components/page/kpi-grid';
import { FilterSearch } from '@/components/page/filter-bar';
import { SectionLoadError } from '@/components/page/section-load-error';
import { useAuth } from '@/features/auth/auth-provider';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import {
  canSendNotifications,
  countNotificationsToday,
} from './notifications-helpers';
import {
  NotificationsInboxPanel,
  type IInboxRow,
} from './notifications-inbox-panel';
import { NotificationsReceiptsDialog } from './notifications-receipts-dialog';
import {
  NotificationsSentPanel,
  type ISentRow,
} from './notifications-sent-panel';
import type { NotificationsTab } from './render-notifications-page';
import {
  useNotificationMutations,
  useNotificationsInbox,
  useNotificationsSent,
  useNotificationsUnreadCount,
} from './use-notifications';

interface INotificationsPageProps {
  /** Kept for StreamedDomainChrome-era call sites; chrome lives on the page now. */
  readonly chrome?: 'full' | 'body';
  readonly tab: NotificationsTab;
  readonly initialInbox?: IPaginatedResult<INotificationInboxItem>;
  readonly initialSent?: IPaginatedResult<INotificationSentItem>;
  readonly initialUnread?: INotificationUnreadCount;
  readonly seedErrorKind?: SectionErrorKind;
}

export function NotificationsPage({
  tab,
  initialInbox,
  initialSent,
  initialUnread,
  seedErrorKind,
}: INotificationsPageProps) {
  const t = useTranslations('modules.notifications');
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [receiptsId, setReceiptsId] = useState<string | null>(null);

  const showCompose = user
    ? canSendNotifications(user.permissions, user.roleName)
    : false;
  const isSent = tab === 'sent';

  const inboxQ = useNotificationsInbox(50, initialInbox);
  const sentQ = useNotificationsSent(50, isSent || showCompose, initialSent);
  const { data: unread } = useNotificationsUnreadCount(initialUnread);
  const { markRead } = useNotificationMutations();

  const q = search.trim().toLowerCase();
  const unreadCount = unread?.count ?? 0;

  const inboxRows: IInboxRow[] = useMemo(() => {
    return (inboxQ.data?.items ?? [])
      .filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.body.toLowerCase().includes(q),
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        createdAt: item.createdAt,
        unread: item.isUnread,
        author: item.createdByName ?? '—',
        priority: item.priority ?? 'NORMAL',
        sessionId:
          item.type === 'auth.new_login' &&
          item.metadata &&
          typeof item.metadata.sessionId === 'string'
            ? item.metadata.sessionId
            : null,
      }));
  }, [inboxQ.data?.items, q]);

  const sentRows: ISentRow[] = useMemo(() => {
    return (sentQ.data?.items ?? initialSent?.items ?? [])
      .filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.body.toLowerCase().includes(q),
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        createdAt: item.createdAt,
        readCount: item.readCount,
        recipientCount: item.recipientCount,
        priority: item.priority ?? 'NORMAL',
      }));
  }, [sentQ.data?.items, initialSent?.items, q]);

  const todayCount = useMemo(
    () =>
      countNotificationsToday(
        isSent
          ? (sentQ.data?.items ?? initialSent?.items ?? [])
          : (inboxQ.data?.items ?? []),
      ),
    [inboxQ.data?.items, initialSent?.items, isSent, sentQ.data?.items],
  );

  const kpis = isSent
    ? [
        {
          id: 'sent',
          label: t('kpi.sent'),
          value: String(sentQ.data?.total ?? initialSent?.total ?? 0),
          icon: 'document-text-bold' as const,
          accent: 'bg-success/15 text-success ring-success/25',
          tone: 'success' as const,
        },
        {
          id: 'today',
          label: t('kpi.today'),
          value: String(todayCount),
          icon: 'calendar-date-bold' as const,
          accent: 'bg-info/15 text-info ring-info/25',
          tone: 'default' as const,
        },
        {
          id: 'inbox',
          label: t('kpi.inbox'),
          value: String(inboxQ.data?.total ?? 0),
          icon: 'inbox-in-bold' as const,
          accent: 'bg-primary/15 text-primary ring-primary/25',
          tone: 'gold' as const,
        },
      ]
    : [
        {
          id: 'unread',
          label: t('kpi.unread'),
          value: String(unreadCount),
          icon: 'notification-unread-bold' as const,
          accent: 'bg-warning/15 text-warning ring-warning/25',
          tone: unreadCount > 0 ? ('warning' as const) : ('success' as const),
        },
        {
          id: 'today',
          label: t('kpi.today'),
          value: String(todayCount),
          icon: 'calendar-date-bold' as const,
          accent: 'bg-info/15 text-info ring-info/25',
          tone: 'default' as const,
        },
        {
          id: 'inbox',
          label: t('kpi.inbox'),
          value: String(inboxQ.data?.total ?? 0),
          icon: 'inbox-in-bold' as const,
          accent: 'bg-primary/15 text-primary ring-primary/25',
          tone: 'gold' as const,
        },
      ];

  return (
    <>
      {seedErrorKind ? (
        <SectionLoadError kind={seedErrorKind} className="mb-4" />
      ) : null}

      <KpiGrid items={kpis} className="mb-4" />

      <FilterSearch
        placeholder={t('search')}
        value={search}
        onChange={setSearch}
        className="mb-4"
      />

      {isSent ? (
        <NotificationsSentPanel
          isError={Boolean(seedErrorKind) || sentQ.isError}
          rows={sentRows}
          total={sentQ.data?.total ?? initialSent?.total ?? 0}
          onRetry={() => void sentQ.refetch()}
          onOpenReceipts={setReceiptsId}
        />
      ) : (
        <NotificationsInboxPanel
          isError={Boolean(seedErrorKind) || inboxQ.isError}
          rows={inboxRows}
          total={inboxQ.data?.total ?? 0}
          unreadCount={unreadCount}
          onRetry={() => void inboxQ.refetch()}
          onMarkRead={(id) => markRead.mutate(id)}
        />
      )}

      <NotificationsReceiptsDialog
        notificationId={receiptsId}
        onClose={() => setReceiptsId(null)}
      />
    </>
  );
}
