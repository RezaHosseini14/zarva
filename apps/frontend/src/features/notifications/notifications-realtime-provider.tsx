'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import type {
  INotificationInboxItem,
  INotificationReadEvent,
  INotificationReceiptsResult,
  INotificationSentItem,
  IPaginatedResult,
} from '@zarva/shared';

import { useAuth } from '@/features/auth/auth-provider';

const WS_ORIGIN =
  process.env.NEXT_PUBLIC_WS_URL ??
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100/api/v1').replace(/\/api\/v1\/?$/, '');

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
export const NOTIFICATIONS_UNREAD_KEY = ['notifications-unread-count'] as const;
export const NOTIFICATIONS_SENT_KEY = ['notifications-sent'] as const;
export const NOTIFICATION_RECEIPTS_KEY = ['notification-receipts'] as const;
export const NOTIFICATIONS_PENDING_CRITICAL_KEY = ['notifications-pending-critical'] as const;

interface IProps {
  readonly children: ReactNode;
}

function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function patchSentReadCount(
  queryClient: ReturnType<typeof useQueryClient>,
  notificationId: string,
): void {
  queryClient.setQueriesData<IPaginatedResult<INotificationSentItem>>(
    { queryKey: NOTIFICATIONS_SENT_KEY },
    (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === notificationId && item.readCount < item.recipientCount
            ? { ...item, readCount: item.readCount + 1 }
            : item,
        ),
      };
    },
  );
}

function patchReceipts(
  queryClient: ReturnType<typeof useQueryClient>,
  event: INotificationReadEvent,
): void {
  queryClient.setQueryData<INotificationReceiptsResult>(
    [...NOTIFICATION_RECEIPTS_KEY, event.notificationId],
    (prev) => {
      if (!prev) return prev;
      const already = prev.recipients.some(
        (r) => r.userId === event.userId && r.readAt !== null,
      );
      const recipients = prev.recipients.map((r) =>
        r.userId === event.userId ? { ...r, readAt: event.readAt } : r,
      );
      return {
        ...prev,
        recipients,
        readCount: already ? prev.readCount : prev.readCount + 1,
      };
    },
  );
}

export function NotificationsRealtimeProvider({ children }: IProps) {
  const { token, isReady } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isReady || !token || !looksLikeJwt(token)) {
      return;
    }

    const socket: Socket = io(`${WS_ORIGIN}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
    });

    const reconcile = () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_SENT_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_RECEIPTS_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_PENDING_CRITICAL_KEY });
    };

    socket.on('notification.created', (payload: INotificationInboxItem) => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_KEY });
      if (payload.priority === 'CRITICAL') {
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_PENDING_CRITICAL_KEY });
        queryClient.setQueryData<ReadonlyArray<INotificationInboxItem>>(
          NOTIFICATIONS_PENDING_CRITICAL_KEY,
          (prev) => {
            const list = prev ?? [];
            if (list.some((i) => i.id === payload.id)) return list;
            return [...list, payload];
          },
        );
      }
    });

    socket.on('notification.read', (event: INotificationReadEvent) => {
      patchSentReadCount(queryClient, event.notificationId);
      patchReceipts(queryClient, event);
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_SENT_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...NOTIFICATION_RECEIPTS_KEY, event.notificationId],
      });
    });

    socket.on('reconnect', reconcile);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [isReady, token, queryClient]);

  return children;
}
