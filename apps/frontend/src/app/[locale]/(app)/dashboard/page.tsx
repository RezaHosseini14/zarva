import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AiPanel } from '@/features/dashboard/ai-panel';
import { getDashboardSkeletonCopy } from '@/features/dashboard/dashboard-skeleton-copy';
import { DashboardLiveRatesSection } from '@/features/dashboard/dashboard-live-rates-section';
import { DashboardOverviewSection } from '@/features/dashboard/dashboard-overview-section';
import {
  DashboardLiveRatesSkeleton,
  DashboardOverviewSkeleton,
} from '@/features/dashboard/dashboard-skeletons';
import { getDashboardInsights } from '@/features/dashboard/get-dashboard-overview';
import { AppShell } from '@/features/shell/app-shell';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IDashboardPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function DashboardAiSlot({
  title,
  emptyBody,
}: {
  readonly title: string;
  readonly emptyBody: string;
}) {
  const result = await loadServerApiSection(() => getDashboardInsights());
  const insights = result.ok ? result.data : [];
  return <AiPanel title={title} insights={insights} emptyBody={emptyBody} />;
}

export default async function DashboardPage({ params }: IDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const { copy, liveRateTitles, liveRateHints } = await getDashboardSkeletonCopy();
  const aiTitle = t('aiTitle');
  const emptyBody = t('aiBody');
  const aiSlot = <DashboardAiSlot title={aiTitle} emptyBody={emptyBody} />;

  return (
    <AppShell title={t('title')}>
      <Suspense
        fallback={
          <DashboardLiveRatesSkeleton
            titles={liveRateTitles}
            hints={liveRateHints}
          />
        }
      >
        <DashboardLiveRatesSection />
      </Suspense>

      <Suspense
        fallback={
          <DashboardOverviewSkeleton copy={copy} aiSlot={aiSlot} />
        }
      >
        <DashboardOverviewSection aiSlot={aiSlot} />
      </Suspense>
    </AppShell>
  );
}
