'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/auth-provider';
import {
  canPlatformBroadcast,
  canSendNotifications,
} from './notifications-helpers';
import { NotificationsComposeDialog } from './notifications-compose-dialog';
import {
  useNotificationMutations,
  useNotificationsUnreadCount,
} from './use-notifications';

/** Static header CTAs — matched height / alignment. */
export function NotificationsHeaderActions() {
  const t = useTranslations('modules.notifications');
  const { user } = useAuth();
  const [composeOpen, setComposeOpen] = useState(false);
  const { data: unread } = useNotificationsUnreadCount();
  const { markAllRead } = useNotificationMutations();

  const showCompose = user
    ? canSendNotifications(user.permissions, user.roleName)
    : false;
  const platform = user
    ? canPlatformBroadcast(user.permissions, user.roleName)
    : false;
  const unreadCount = unread?.count ?? 0;

  if (!showCompose && unreadCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {unreadCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-9 min-h-9 px-4"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <Icon name="check-read-bold" className="text-base" />
            {t('markAllRead')}
          </Button>
        ) : null}
        {showCompose ? (
          <Button
            type="button"
            size="default"
            className="h-9 min-h-9 px-4"
            onClick={() => setComposeOpen(true)}
          >
            <Icon name="add-circle-bold" className="text-base" />
            {t('compose.open')}
          </Button>
        ) : null}
      </div>
      <NotificationsComposeDialog
        open={composeOpen}
        canPlatform={platform}
        onClose={() => setComposeOpen(false)}
      />
    </>
  );
}
