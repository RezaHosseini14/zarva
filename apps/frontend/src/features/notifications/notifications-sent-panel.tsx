'use client';

import { useTranslations } from 'next-intl';
import type { NotificationPriority } from '@zarva/shared';

import { StatusBadge } from '@/components/page/status-badge';
import { NotificationTimeCell } from './notification-time-cell';
import { NotificationTitleCell } from './notification-title-cell';
import { NotificationsTablePanel } from './notifications-table-panel';

export interface ISentRow {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly readCount: number;
  readonly recipientCount: number;
  readonly priority: NotificationPriority;
}

interface IProps {
  readonly isError: boolean;
  readonly rows: ReadonlyArray<ISentRow>;
  readonly total: number;
  readonly onRetry: () => void;
  readonly onOpenReceipts: (id: string) => void;
}

export function NotificationsSentPanel({
  isError,
  rows,
  total,
  onRetry,
  onOpenReceipts,
}: IProps) {
  const t = useTranslations('modules.notifications');

  return (
    <NotificationsTablePanel<ISentRow>
      isError={isError}
      errorTitle={t('errors.loadSent')}
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
              onClick={() => onOpenReceipts(r.id)}
            />
          ),
        },
        {
          id: 'time',
          header: t('cols.time'),
          className: 'whitespace-nowrap',
          cell: (r) => <NotificationTimeCell iso={r.createdAt} />,
        },
        {
          id: 'receipts',
          header: t('cols.receipts'),
          className: 'w-0 whitespace-nowrap !px-2 !pe-3 text-end',
          cell: (r) => {
            const isAllRead =
              r.recipientCount > 0 && r.readCount >= r.recipientCount;
            return (
              <StatusBadge
                label={
                  <span className="zarva-num">
                    {t('receipts.counter', {
                      read: r.readCount,
                      total: r.recipientCount,
                    })}
                  </span>
                }
                tone={isAllRead ? 'success' : 'info'}
                icon={isAllRead ? 'check-read-bold' : 'users-group-rounded-bold'}
                onClick={() => onOpenReceipts(r.id)}
              />
            );
          },
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyIcon="document-text-bold"
      emptyAccent="bg-info/15 text-info ring-info/25"
      emptyTitle={t('sentEmptyTitle')}
      emptyDescription={t('sentEmptyDescription')}
      total={total}
    />
  );
}
