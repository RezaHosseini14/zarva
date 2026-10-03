import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageHeader } from '@/components/page/page-header';
import { AppShell } from '@/features/shell/app-shell';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { NotificationsHeaderActions } from './notifications-header-actions';
import {
  NOTIFICATIONS_INBOX_COLUMN_KEYS,
  NOTIFICATIONS_INBOX_KPI_SLOTS,
  NOTIFICATIONS_SENT_COLUMN_KEYS,
  NOTIFICATIONS_SENT_KPI_SLOTS,
  resolveNotificationsColumnHeaders,
  resolveNotificationsSkeletonKpis,
} from './notifications-kpi-slots';
import { NotificationsNav } from './notifications-nav';
import { NotificationsSection } from './notifications-section';

export type NotificationsTab = 'inbox' | 'sent';

interface IProps {
  readonly locale: string;
  readonly tab: NotificationsTab;
}

/** Reports-style chrome: header + SubNav static; body streams in Suspense. */
export async function renderNotificationsPage({ locale, tab }: IProps) {
  setRequestLocale(locale);
  const t = await getTranslations('modules.notifications');
  const isSent = tab === 'sent';
  const slots = isSent
    ? NOTIFICATIONS_SENT_KPI_SLOTS
    : NOTIFICATIONS_INBOX_KPI_SLOTS;
  const columnKeys = isSent
    ? NOTIFICATIONS_SENT_COLUMN_KEYS
    : NOTIFICATIONS_INBOX_COLUMN_KEYS;

  return (
    <AppShell title={t('title')}>
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={<NotificationsHeaderActions />}
      />
      <NotificationsNav />
      <Suspense
        fallback={
          <DomainListBodySkeleton
            skeletonKpis={resolveNotificationsSkeletonKpis(t, slots)}
            searchPlaceholder={t('search')}
            columnHeaders={resolveNotificationsColumnHeaders(t, columnKeys)}
          />
        }
      >
        <NotificationsSection tab={tab} />
      </Suspense>
    </AppShell>
  );
}
