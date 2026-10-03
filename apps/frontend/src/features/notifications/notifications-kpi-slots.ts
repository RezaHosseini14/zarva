import type { IconName } from '@/components/ui/icon';
import { ACCENT, type ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface ISlot {
  readonly id: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly accent: string;
}

export const NOTIFICATIONS_INBOX_KPI_SLOTS: ReadonlyArray<ISlot> = [
  {
    id: 'unread',
    labelKey: 'kpi.unread',
    icon: 'notification-unread-bold',
    accent: ACCENT.warning,
  },
  {
    id: 'today',
    labelKey: 'kpi.today',
    icon: 'calendar-date-bold',
    accent: ACCENT.info,
  },
  {
    id: 'inbox',
    labelKey: 'kpi.inbox',
    icon: 'inbox-in-bold',
    accent: ACCENT.primary,
  },
];

export const NOTIFICATIONS_SENT_KPI_SLOTS: ReadonlyArray<ISlot> = [
  {
    id: 'sent',
    labelKey: 'kpi.sent',
    icon: 'document-text-bold',
    accent: ACCENT.success,
  },
  {
    id: 'today',
    labelKey: 'kpi.today',
    icon: 'calendar-date-bold',
    accent: ACCENT.info,
  },
  {
    id: 'inbox',
    labelKey: 'kpi.inbox',
    icon: 'inbox-in-bold',
    accent: ACCENT.primary,
  },
];

export const NOTIFICATIONS_INBOX_COLUMN_KEYS = [
  'cols.title',
  'cols.author',
  'cols.time',
  'cols.status',
] as const;

export const NOTIFICATIONS_SENT_COLUMN_KEYS = [
  'cols.title',
  'cols.time',
  'cols.receipts',
] as const;

type TFn = (key: string) => string;

export function resolveNotificationsSkeletonKpis(
  t: TFn,
  slots: ReadonlyArray<ISlot>,
): ReadonlyArray<ISkeletonKpi> {
  return slots.map((slot) => ({
    label: t(slot.labelKey),
    icon: slot.icon,
    accent: slot.accent,
  }));
}

export function resolveNotificationsColumnHeaders(
  t: TFn,
  keys: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return keys.map((key) => t(key));
}
