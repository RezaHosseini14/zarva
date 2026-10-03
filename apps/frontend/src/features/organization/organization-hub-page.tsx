'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';
import { Icon } from '@/components/ui/icon';

export function OrganizationHubPage() {
  const t = useTranslations('modules.organization');
  const locale = useLocale();
  const p = (h: string) => `/${locale}${h}`;

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <HubCards
        items={[
          {
            href: p('/organization/profile'),
            title: t('nav.profile'),
            description: t('hub.profile'),
            icon: <Icon name="buildings-2-bold" className="text-lg" />,
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
          {
            href: p('/organization/users'),
            title: t('nav.users'),
            description: t('hub.users'),
            icon: <Icon name="users-group-rounded-bold" className="text-lg" />,
            accent: 'bg-info/15 text-info ring-info/25',
          },
          {
            href: p('/organization/roles'),
            title: t('nav.roles'),
            description: t('hub.roles'),
            icon: <Icon name="shield-keyhole-bold" className="text-lg" />,
            accent: 'bg-warning/15 text-warning ring-warning/25',
          },
          {
            href: p('/organization/audit'),
            title: t('nav.audit'),
            description: t('hub.audit'),
            icon: <Icon name="clipboard-list-bold" className="text-lg" />,
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
        ]}
      />
    </AppShell>
  );
}
