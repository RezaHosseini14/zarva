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
import { AppShell } from '@/features/shell/app-shell';

interface IDashboardPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: IDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const { copy, liveRateTitles, liveRateHints } = await getDashboardSkeletonCopy();
  const aiTitle = t('aiTitle');
  const aiBody = t('aiBody');
  const aiSlot = <AiPanel title={aiTitle} body={aiBody} />;

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
