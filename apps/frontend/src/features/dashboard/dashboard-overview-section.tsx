import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/page/error-state';
import { DashboardOverviewPanel } from '@/features/dashboard/dashboard-overview-panel';
import { getDashboardOverview } from '@/features/dashboard/get-dashboard-overview';

interface IDashboardOverviewSectionProps {
  readonly aiSlot: ReactNode;
}

export async function DashboardOverviewSection({
  aiSlot,
}: IDashboardOverviewSectionProps) {
  const t = await getTranslations('dashboard');

  let overview: Awaited<ReturnType<typeof getDashboardOverview>> | null = null;
  let loadFailed = false;

  try {
    overview = await getDashboardOverview();
  } catch {
    loadFailed = true;
  }

  if (loadFailed || !overview) {
    return (
      <>
        <ErrorState
          className="mb-4"
          title={t('overviewErrorTitle')}
          description={t('overviewErrorDescription')}
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          <div className="min-h-[22rem] lg:col-span-2 sm:min-h-[24rem]" />
          {aiSlot}
        </div>
      </>
    );
  }

  return <DashboardOverviewPanel overview={overview} aiSlot={aiSlot} />;
}
