import type { NotificationPriority } from '@zarva/shared';

import type { IAuthUser } from '../auth/auth.types';

const PRIORITY_PERMISSION: Record<NotificationPriority, string> = {
  LOW: 'notifications.send.low',
  NORMAL: 'notifications.send.normal',
  HIGH: 'notifications.send.high',
  CRITICAL: 'notifications.send.critical',
};

/** Pure helpers extracted for unit tests (no Nest DI). */
export function canSendOrgNotification(user: IAuthUser): boolean {
  return (
    user.roleName === 'SUPER_ADMIN' ||
    user.roleName === 'PLATFORM_ADMIN' ||
    user.roleName === 'ORG_ADMIN' ||
    user.permissions.includes('notifications.send') ||
    user.permissions.includes('notifications.broadcast_platform') ||
    user.permissions.some((p) => p.startsWith('notifications.send.'))
  );
}

export function canBroadcastPlatformNotification(user: IAuthUser): boolean {
  return (
    user.roleName === 'SUPER_ADMIN' ||
    user.roleName === 'PLATFORM_ADMIN' ||
    user.permissions.includes('notifications.broadcast_platform')
  );
}

export function canSendPriority(user: IAuthUser, priority: NotificationPriority): boolean {
  if (user.roleName === 'SUPER_ADMIN' || user.roleName === 'PLATFORM_ADMIN') {
    return true;
  }
  const key = PRIORITY_PERMISSION[priority];
  return user.permissions.includes(key);
}

export function allowedSendPriorities(user: IAuthUser): ReadonlyArray<NotificationPriority> {
  const all: NotificationPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
  return all.filter((p) => canSendPriority(user, p));
}

export function resolveAudienceRequiresPlatform(
  audience: 'USERS' | 'ORG_ALL' | 'ORGS' | 'PLATFORM_ALL',
): boolean {
  return audience === 'ORGS' || audience === 'PLATFORM_ALL';
}
