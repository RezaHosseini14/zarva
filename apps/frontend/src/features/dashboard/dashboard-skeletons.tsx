import type { ReactNode } from 'react';
import type { LiveRateId } from '@zarva/shared';

import type { IconName } from '@/components/ui/icon';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import {
  ActivityRowSkeleton,
  ForecastChartSkeleton,
  MetricCardHeader,
  MetricCardShell,
} from '@/features/dashboard/dashboard-skeleton-bits';
import { LIVE_RATE_META } from '@/features/dashboard/live-rate-meta';

const RATE_ORDER: ReadonlyArray<LiveRateId> = [
  'xau_usd',
  'iran_gold_24k',
  'iran_gold_18k',
  'usd_irr',
];

const VALUE_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28'] as const;
const CHIP_WIDTHS = ['w-14', 'w-16', 'w-12', 'w-14'] as const;
const ACTIVITY_WIDTHS = ['w-36', 'w-28', 'w-40'] as const;

const KPI_META: ReadonlyArray<{
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly accent: string;
}> = [
  {
    id: 'salesToday',
    label: 'salesToday',
    icon: 'cart-large-2-bold',
    accent: 'bg-success/15 text-success ring-success/25',
  },
  {
    id: 'goldStock',
    label: 'goldStock',
    icon: 'crown-star-bold',
    accent: 'bg-primary/15 text-primary ring-primary/25',
  },
  {
    id: 'customers',
    label: 'customers',
    icon: 'users-group-rounded-bold',
    accent: 'bg-info/15 text-info ring-info/25',
  },
  {
    id: 'margin',
    label: 'margin',
    icon: 'chart-bold',
    accent: 'bg-warning/15 text-warning ring-warning/25',
  },
];

export interface IDashboardSkeletonCopy {
  readonly forecastTitle: string;
  readonly activityTitle: string;
  readonly kpiLabels: Readonly<Record<(typeof KPI_META)[number]['label'], string>>;
}

export interface ILiveRateSkeletonTitles {
  readonly titles: Readonly<Record<LiveRateId, string>>;
  readonly hints: Readonly<Record<LiveRateId, string>>;
}

export function DashboardLiveRatesSkeleton({
  titles,
  hints,
}: ILiveRateSkeletonTitles) {
  return (
    <section className="mb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RATE_ORDER.map((id, i) => {
          const meta = LIVE_RATE_META[id];
          return (
            <MetricCardShell
              key={id}
              valueWidth={VALUE_WIDTHS[i] ?? 'w-28'}
              chipWidth={CHIP_WIDTHS[i] ?? 'w-14'}
              header={
                <MetricCardHeader
                  icon={meta.icon}
                  accent={meta.accent}
                  label={titles[id]}
                  hint={hints[id]}
                />
              }
            />
          );
        })}
      </div>
    </section>
  );
}

interface IDashboardOverviewSkeletonProps {
  readonly aiSlot: ReactNode;
  readonly copy: IDashboardSkeletonCopy;
}

export function DashboardOverviewSkeleton({
  aiSlot,
  copy,
}: IDashboardOverviewSkeletonProps) {
  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_META.map((kpi, i) => (
          <MetricCardShell
            key={kpi.id}
            valueWidth={VALUE_WIDTHS[i] ?? 'w-28'}
            chipWidth={CHIP_WIDTHS[i] ?? 'w-14'}
            header={
              <MetricCardHeader
                icon={kpi.icon}
                accent={kpi.accent}
                label={copy.kpiLabels[kpi.label]}
              />
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="min-h-[22rem] lg:col-span-2 sm:min-h-[24rem]">
          <DashboardPanel
            title={copy.forecastTitle}
            icon="chart-bold"
            accent="bg-primary/15 text-primary ring-primary/25"
            className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
            headerClassName="shrink-0"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            <ForecastChartSkeleton />
          </DashboardPanel>
        </div>
        {aiSlot}
      </div>

      <div className="mt-4">
        <DashboardPanel
          title={copy.activityTitle}
          icon="clipboard-list-bold"
          accent="bg-info/15 text-info ring-info/25"
        >
          <ul className="divide-y divide-border/60" aria-hidden>
            {ACTIVITY_WIDTHS.map((width) => (
              <ActivityRowSkeleton key={width} titleWidth={width} />
            ))}
          </ul>
        </DashboardPanel>
      </div>
    </>
  );
}
