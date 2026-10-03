'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';
import { Icon, type IconName } from '@/components/ui/icon';

const SECTIONS = [
  'general',
  'business',
  'invoices',
  'gold',
  'inventory',
  'accounting',
  'tax',
  'notifications',
  'security',
  'appearance',
  'language',
  'backup',
  'billing',
] as const;

const SECTION_ICONS: Record<(typeof SECTIONS)[number], IconName> = {
  general: 'settings-bold',
  business: 'shop-bold',
  invoices: 'document-text-bold',
  gold: 'crown-star-bold',
  inventory: 'box-bold',
  accounting: 'calculator-bold',
  tax: 'bill-list-bold',
  notifications: 'bell-bold',
  security: 'shield-keyhole-bold',
  appearance: 'settings-bold',
  language: 'global-bold',
  backup: 'refresh-bold',
  billing: 'card-bold',
};

/** Same accent tokens as dashboard KPI / activity boxes */
const SECTION_ACCENTS: Record<(typeof SECTIONS)[number], string> = {
  general: 'bg-primary/15 text-primary ring-primary/25',
  business: 'bg-success/15 text-success ring-success/25',
  invoices: 'bg-info/15 text-info ring-info/25',
  gold: 'bg-primary/15 text-primary ring-primary/25',
  inventory: 'bg-warning/15 text-warning ring-warning/25',
  accounting: 'bg-info/15 text-info ring-info/25',
  tax: 'bg-warning/15 text-warning ring-warning/25',
  notifications: 'bg-success/15 text-success ring-success/25',
  security: 'bg-danger/15 text-danger ring-danger/25',
  appearance: 'bg-primary/15 text-primary ring-primary/25',
  language: 'bg-info/15 text-info ring-info/25',
  backup: 'bg-warning/15 text-warning ring-warning/25',
  billing: 'bg-success/15 text-success ring-success/25',
};

export function SettingsHubPage() {
  const t = useTranslations('modules.settings');
  const locale = useLocale();

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <HubCards
        items={SECTIONS.map((s) => ({
          href: `/${locale}/settings/${s}`,
          title: t(`sections.${s}.title`),
          description: t(`sections.${s}.description`),
          icon: <Icon name={SECTION_ICONS[s]} className="text-lg" />,
          accent: SECTION_ACCENTS[s],
        }))}
      />
    </AppShell>
  );
}
