export function canSendNotifications(
  permissions: ReadonlyArray<string>,
  roleName: string,
): boolean {
  return (
    roleName === 'SUPER_ADMIN' ||
    roleName === 'PLATFORM_ADMIN' ||
    roleName === 'ORG_ADMIN' ||
    permissions.includes('notifications.send') ||
    permissions.includes('notifications.broadcast_platform') ||
    permissions.some((p) => p.startsWith('notifications.send.'))
  );
}

export function canPlatformBroadcast(
  permissions: ReadonlyArray<string>,
  roleName: string,
): boolean {
  return (
    roleName === 'SUPER_ADMIN' ||
    roleName === 'PLATFORM_ADMIN' ||
    permissions.includes('notifications.broadcast_platform')
  );
}

export function formatNotificationTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function countNotificationsToday(
  items: ReadonlyArray<{ createdAt: string }>,
): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return items.filter((item) => new Date(item.createdAt) >= start).length;
}
