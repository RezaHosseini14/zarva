'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ICreateNotificationRequest,
  INotificationInboxItem,
  INotificationOrgOption,
  INotificationReceiptsResult,
  INotificationRecipientUser,
  INotificationSentItem,
  INotificationUnreadCount,
  IPaginatedResult,
} from '@zarva/shared';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
import {
  NOTIFICATION_RECEIPTS_KEY,
  NOTIFICATIONS_PENDING_CRITICAL_KEY,
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_SENT_KEY,
  NOTIFICATIONS_UNREAD_KEY,
} from './notifications-realtime-provider';

export function useNotificationsInbox(
  pageSize = 20,
  initialData?: IPaginatedResult<INotificationInboxItem>,
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, pageSize],
    enabled: Boolean(user),
    queryFn: () =>
      apiFetch<IPaginatedResult<INotificationInboxItem>>(
        `/notifications?page=1&pageSize=${pageSize}`,
      ),
    initialData,
    staleTime: initialData ? 30_000 : 0,
  });
}

export function useNotificationsUnreadCount(initialData?: INotificationUnreadCount) {
  const { user } = useAuth();
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_KEY,
    enabled: Boolean(user),
    queryFn: () => apiFetch<INotificationUnreadCount>('/notifications/unread-count'),
    initialData,
    staleTime: initialData ? 30_000 : 0,
  });
}

export function useNotificationsSent(
  pageSize = 50,
  enabled = true,
  initialData?: IPaginatedResult<INotificationSentItem>,
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...NOTIFICATIONS_SENT_KEY, pageSize],
    enabled: enabled && Boolean(user),
    queryFn: () =>
      apiFetch<IPaginatedResult<INotificationSentItem>>(
        `/notifications/sent?page=1&pageSize=${pageSize}`,
      ),
    initialData,
    staleTime: initialData ? 30_000 : 0,
  });
}

export function useNotificationReceipts(notificationId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...NOTIFICATION_RECEIPTS_KEY, notificationId],
    enabled: Boolean(user) && Boolean(notificationId),
    queryFn: () =>
      apiFetch<INotificationReceiptsResult>(
        `/notifications/sent/${notificationId}/receipts`,
      ),
  });
}

export function usePendingCriticalNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: NOTIFICATIONS_PENDING_CRITICAL_KEY,
    enabled: Boolean(user),
    queryFn: () =>
      apiFetch<ReadonlyArray<INotificationInboxItem>>('/notifications/pending-critical'),
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_KEY });
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_SENT_KEY });
    await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_PENDING_CRITICAL_KEY });
  };

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiFetch<INotificationInboxItem>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      apiFetch<{ updated: number }>('/notifications/read-all', {
        method: 'PATCH',
      }),
    onSuccess: invalidate,
  });

  const acknowledge = useMutation({
    mutationFn: (id: string) =>
      apiFetch<INotificationInboxItem>(`/notifications/${id}/acknowledge`, {
        method: 'PATCH',
      }),
    onSuccess: invalidate,
  });

  const create = useMutation({
    mutationFn: (body: ICreateNotificationRequest) =>
      apiFetch<{ id: string; recipientCount: number }>('/notifications', {
        method: 'POST',
        body,
      }),
    onSuccess: invalidate,
  });

  return { markRead, markAllRead, acknowledge, create };
}

export function useRecipientUsers(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notification-recipient-users'],
    enabled: enabled && Boolean(user),
    queryFn: () =>
      apiFetch<ReadonlyArray<INotificationRecipientUser>>(
        '/notifications/recipients/users',
      ),
  });
}

export function useRecipientOrgs(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notification-recipient-orgs'],
    enabled: enabled && Boolean(user),
    queryFn: () =>
      apiFetch<ReadonlyArray<INotificationOrgOption>>(
        '/notifications/recipients/organizations',
      ),
  });
}
