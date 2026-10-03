import { cache } from 'react';
import type {
  INotificationInboxItem,
  INotificationSentItem,
  INotificationUnreadCount,
  IPaginatedResult,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export const getNotificationsInbox = cache(
  async (pageSize = 50): Promise<IPaginatedResult<INotificationInboxItem>> =>
    serverApiFetch(`/notifications?page=1&pageSize=${pageSize}`),
);

export const getNotificationsSent = cache(
  async (pageSize = 50): Promise<IPaginatedResult<INotificationSentItem>> =>
    serverApiFetch(`/notifications/sent?page=1&pageSize=${pageSize}`),
);

export const getNotificationsUnreadCount = cache(
  async (): Promise<INotificationUnreadCount> =>
    serverApiFetch('/notifications/unread-count'),
);
