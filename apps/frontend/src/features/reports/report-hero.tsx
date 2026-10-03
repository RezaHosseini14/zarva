'use client';

import { useTranslations } from 'next-intl';

import type { IconName } from '@/components/ui/icon';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { cn } from '@/lib/utils';
import { useResolveMoney } from '@/features/settings/use-resolve-money';
import { useResolveWeight } from '@/features/settings/use-resolve-weight';

interface IProps {
  readonly total: string;
  readonly period: string;
  readonly icon: IconName;
  readonly accent: string;
  readonly className?: string;
}

/** Headline total: gold focal number in nested rail (DESIGN.md accent on key figures). */
export function ReportHero({ total, period, icon, accent, className }: IProps) {
  const t = useTranslations('modules.reports');
  const resolveMoney = useResolveMoney();
  const resolveWeight = useResolveWeight();
  const raw = total.trim() ? total : '-';
  const display = resolveWeight(resolveMoney(raw));
  const periodLabel = period.trim() ? period : t('kpi.thisMonth');

  return (
    <DashboardPanel
      title={t('summaryLabel')}
      icon={icon}
      accent={accent}
      className={cn(
        'flex h-full min-h-[22rem] flex-col overflow-hidden sm:min-h-[24rem]',
        className,
      )}
      headerClassName="shrink-0"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <p className="max-w-[18rem] text-sm leading-relaxed text-secondary">
        {t('summaryHint')}
      </p>

      <div className="-mx-4 -mb-4 mt-auto border-t border-primary/12 bg-nested/70 px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 sm:py-5">
        <div className="flex items-end justify-between gap-3">
          <p className="zarva-num min-w-0 truncate text-3xl font-semibold leading-none tracking-tight text-primary sm:text-4xl">
            {display}
          </p>
          <span className="shrink-0 rounded-md bg-background/40 px-2 py-1 text-xs font-semibold tabular-nums text-secondary">
            {periodLabel}
          </span>
        </div>
      </div>
    </DashboardPanel>
  );
}
