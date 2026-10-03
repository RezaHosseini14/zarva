'use client';

import { useTranslations } from 'next-intl';

import { SubNav } from '@/components/page/sub-nav';

/** Same SubNav chrome as reports — linear icons sit on the inline-start (right in fa). */
export function NotificationsNav() {
  const t = useTranslations('modules.notifications');

  return (
    <SubNav
      className="mb-5"
      items={[
        {
          href: '/notifications',
          label: t('tabs.inbox'),
          icon: 'inbox-in-linear',
        },
        {
          href: '/notifications/sent',
          label: t('tabs.sent'),
          icon: 'inbox-out-linear',
        },
      ]}
    />
  );
}
