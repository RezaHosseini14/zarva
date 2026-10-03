'use client';

import { useTranslations } from 'next-intl';
import type { NotificationPriority } from '@zarva/shared';

import { apiFetch } from '@/lib/api';
import { NotificationStatusCell } from './notification-status-cell';
import { NotificationTimeCell } from './notification-time-cell';
import { NotificationTitleCell } from './notification-title-cell';
import { NotificationsTablePanel } from './notifications-table-panel';

export interface IInboxRow {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly unread: boolean;
  readonly author: string;
  readonly priority: NotificationPriority;
  readonly sessionId: string | null;
}

interface IProps {
  readonly isError: boolean;
  readonly rows: ReadonlyArray<IInboxRow>;
  readonly total: number;
  readonly unreadCount: number;
  readonly onRetry: () => void;
  readonly onMarkRead: (id: string) => void;
}

export function NotificationsInboxPanel({
  isError,
  rows,
  total,
  unreadCount,
  onRetry,
  onMarkRead,
}: IProps) {
  const t = useTranslations('modules.notifications');

  return (
    <NotificationsTablePanel<IInboxRow>
      isError={isError}
      errorTitle={t('errors.loadInbox')}
      onRetry={onRetry}
      columns={[
        {
          id: 'title',
          header: t('cols.title'),
          cell: (r) => (
            <NotificationTitleCell
              title={r.title}
              body={r.body}
              priority={r.priority}
              unread={r.unread}
              onClick={() => {
                if (r.unread) onMarkRead(r.id);
              }}
            />
          ),
        },
        { id: 'author', header: t('cols.author'), cell: (r) => r.author },
        {
          id: 'time',
          header: t('cols.time'),
          className: 'whitespace-nowrap',
          cell: (r) => <NotificationTimeCell iso={r.createdAt} />,
        },
        {
          id: 'status',
          header: t('cols.status'),
          className: 'w-0 whitespace-nowrap !px-2 !pe-3 text-end',
          cell: (r) => (
            <NotificationStatusCell
              unread={r.unread}
              sessionId={r.sessionId}
              onTerminate={
                r.sessionId
                  ? () => {
                      void apiFetch(`/auth/sessions/${r.sessionId}/deny`, {
                        method: 'POST',
                        body: {},
                      });
                      if (r.unread) onMarkRead(r.id);
                    }
                  : undefined
              }
            />
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyIcon="bell-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      total={total}
      footerExtra={
        unreadCount > 0 ? (
          <span className="ms-2 text-warning">
            · {t('kpi.unread')} {unreadCount}
          </span>
        ) : null
      }
    />
  );
}
