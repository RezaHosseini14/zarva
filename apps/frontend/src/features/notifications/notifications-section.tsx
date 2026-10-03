import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import {
  getNotificationsInbox,
  getNotificationsSent,
  getNotificationsUnreadCount,
} from './get-notifications-data';
import { NotificationsPage } from './notifications-page';
import type { NotificationsTab } from './render-notifications-page';

interface IProps {
  readonly tab: NotificationsTab;
}

export async function NotificationsSection({ tab }: IProps) {
  if (tab === 'sent') {
    const result = await loadServerApiSection(async () => {
      const [sent, unread] = await Promise.all([
        getNotificationsSent(50),
        getNotificationsUnreadCount(),
      ]);
      return { sent, unread };
    });

    if (!result.ok) {
      return (
        <NotificationsPage chrome="body" tab="sent" seedErrorKind={result.error.kind} />
      );
    }

    return (
      <NotificationsPage
        chrome="body"
        tab="sent"
        initialSent={result.data.sent}
        initialUnread={result.data.unread}
      />
    );
  }

  const result = await loadServerApiSection(async () => {
    const [inbox, unread] = await Promise.all([
      getNotificationsInbox(50),
      getNotificationsUnreadCount(),
    ]);
    return { inbox, unread };
  });

  if (!result.ok) {
    return (
      <NotificationsPage chrome="body" tab="inbox" seedErrorKind={result.error.kind} />
    );
  }

  return (
    <NotificationsPage
      chrome="body"
      tab="inbox"
      initialInbox={result.data.inbox}
      initialUnread={result.data.unread}
    />
  );
}
