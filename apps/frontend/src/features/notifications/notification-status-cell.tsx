'use client';

import { useTranslations } from 'next-intl';

import { StatusBadge } from '@/components/page/status-badge';

interface INotificationStatusCellProps {
  readonly unread: boolean;
  readonly sessionId: string | null;
  readonly onTerminate?: () => void;
}

/** Status + optional session action — full-size chips, column still content-width. */
export function NotificationStatusCell({
  unread,
  sessionId,
  onTerminate,
}: INotificationStatusCellProps) {
  const t = useTranslations('modules.notifications');

  return (
    <div className="inline-flex flex-nowrap items-center gap-1.5">
      <StatusBadge
        label={unread ? t('unread') : t('read')}
        tone={unread ? 'warning' : 'success'}
        icon={unread ? 'notification-unread-lines-bold' : 'check-read-bold'}
      />

      {sessionId && onTerminate ? (
        <StatusBadge
          label={t('terminateSession')}
          tone="danger"
          icon="logout-2-bold"
          onClick={onTerminate}
        />
      ) : null}
    </div>
  );
}
