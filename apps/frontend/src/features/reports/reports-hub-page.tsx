import { getLocale, getTranslations } from 'next-intl/server';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { Icon } from '@/components/ui/icon';
import { REPORT_KINDS } from '@/features/reports/report-kinds';

export async function ReportsHubPage() {
  const t = await getTranslations('modules.reports');
  const locale = await getLocale();

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />

      <DashboardPanel
        title={t('hubIntroTitle')}
        icon="chart-bold"
        accent="bg-primary/15 text-primary ring-primary/25"
        className="mb-6"
      >
        <p className="max-w-xl text-sm leading-relaxed text-secondary">{t('hubIntroDesc')}</p>
      </DashboardPanel>

      <HubCards
        items={REPORT_KINDS.map((kind) => ({
          href: `/${locale}${kind.href}`,
          title: t(`cards.${kind.key}`),
          description: t(`cards.${kind.key}Desc`),
          icon: <Icon name={kind.icon} className="text-lg" />,
          accent: kind.accent,
        }))}
      />
    </AppShell>
  );
}
