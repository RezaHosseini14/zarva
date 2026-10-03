import type { IconName } from '@/components/ui/icon';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import {
  ForecastChartSkeleton,
  MetricCardHeader,
  MetricCardShell,
  Shimmer,
} from '@/features/dashboard/dashboard-skeleton-bits';

export interface IReportSkeletonKpiSlot {
  readonly label: string;
  readonly icon: IconName;
}

export interface IReportSkeletonCopy {
  readonly seriesTitle: string;
  readonly summaryLabel: string;
  readonly kpiSlots: ReadonlyArray<IReportSkeletonKpiSlot>;
}

interface IReportBodySkeletonProps {
  readonly copy: IReportSkeletonCopy;
  readonly accent: string;
  readonly icon: IconName;
}

const VALUE_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28'] as const;
const CHIP_WIDTHS = ['w-14', 'w-16', 'w-12', 'w-14'] as const;

export function ReportBodySkeleton({
  copy,
  accent,
  icon,
}: IReportBodySkeletonProps) {
  const slots = copy.kpiSlots.slice(0, 4);

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {slots.map((slot, i) => (
          <MetricCardShell
            key={`${slot.label}-${i}`}
            valueWidth={VALUE_WIDTHS[i] ?? 'w-28'}
            chipWidth={CHIP_WIDTHS[i] ?? 'w-14'}
            header={
              <MetricCardHeader
                icon={slot.icon}
                accent={accent}
                label={slot.label}
              />
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <DashboardPanel
          title={copy.summaryLabel}
          icon={icon}
          accent={accent}
          className="flex h-full min-h-[22rem] flex-col overflow-hidden sm:min-h-[24rem]"
          headerClassName="shrink-0"
          bodyClassName="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col" aria-busy="true">
            <Shimmer className="h-4 w-48 max-w-full" />
            <div className="-mx-4 -mb-4 mt-auto border-t border-primary/12 bg-nested/70 px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 sm:py-5">
              <div className="flex items-end justify-between gap-3">
                <Shimmer className="h-9 w-40 sm:h-11 sm:w-52" />
                <Shimmer className="h-6 w-16 shrink-0 rounded-md" />
              </div>
            </div>
          </div>
        </DashboardPanel>

        <div className="min-h-[22rem] lg:col-span-2 sm:min-h-[24rem]">
          <DashboardPanel
            title={copy.seriesTitle}
            icon="chart-bold"
            accent="bg-primary/15 text-primary ring-primary/25"
            className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
            headerClassName="shrink-0"
            bodyClassName="flex min-h-0 flex-1 flex-col"
          >
            <ForecastChartSkeleton />
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
