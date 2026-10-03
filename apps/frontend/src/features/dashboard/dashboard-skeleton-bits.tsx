import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function Shimmer({ className }: { readonly className?: string }) {
  return <div className={cn('zarva-shimmer', className)} aria-hidden />;
}

export function ForecastChartSkeleton() {
  return (
    <div className="zarva-skeleton-chart min-h-0 flex-1" aria-hidden>
      <div className="zarva-skeleton-chart__grid" />
      <div className="zarva-skeleton-chart__area" />
      <div className="zarva-skeleton-chart__wash zarva-shimmer opacity-40" />
    </div>
  );
}

/** Matches LiveRateCard / KpiGrid shell: fixed-height card + pinned footer rail. */
export function MetricCardShell({
  header,
  valueWidth,
  chipWidth = 'w-14',
}: {
  readonly header: ReactNode;
  readonly valueWidth: string;
  readonly chipWidth?: string;
}) {
  return (
    <article className="zarva-glass-card zarva-metric-card" aria-busy="true">
      <div className="zarva-metric-card__header">{header}</div>
      <div className="zarva-metric-card__footer">
        <div className="zarva-metric-card__footer-row">
          <Shimmer className={cn('h-[1.65rem]', valueWidth)} />
          <Shimmer className={cn('h-7 shrink-0 rounded-md', chipWidth)} />
        </div>
      </div>
    </article>
  );
}

export function MetricCardHeader({
  icon,
  accent,
  label,
  hint,
}: {
  readonly icon: IconName;
  readonly accent: string;
  readonly label: string;
  readonly hint?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
          accent,
        )}
      >
        <Icon name={icon} className="text-lg" />
      </span>
      {hint ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none tracking-tight text-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-[11px] font-semibold leading-none text-secondary">
            {hint}
          </p>
        </div>
      ) : (
        <p className="min-w-0 truncate text-sm font-bold leading-none tracking-tight text-foreground">
          {label}
        </p>
      )}
    </div>
  );
}

export function ActivityRowSkeleton({
  titleWidth,
}: {
  readonly titleWidth: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-3">
        <Shimmer className="size-9 shrink-0 rounded-lg" />
        <Shimmer className={cn('h-3.5', titleWidth)} />
      </div>
      <Shimmer className="h-6 w-14 shrink-0 rounded-full" />
    </li>
  );
}
