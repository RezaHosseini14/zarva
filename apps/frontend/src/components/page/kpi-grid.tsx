'use client';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useResolveMoney } from '@/features/settings/use-resolve-money';
import { useResolveWeight } from '@/features/settings/use-resolve-weight';

export interface IKpiItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly tone?: 'default' | 'up' | 'down' | 'warning' | 'danger' | 'success' | 'gold';
  readonly icon?: IconName;
  readonly accent?: string;
}

interface IKpiGridProps {
  readonly items: ReadonlyArray<IKpiItem>;
  readonly className?: string;
  /** @deprecated Always glass; kept for call-site compat */
  readonly surface?: 'panel' | 'glass';
}

const VALUE_TONE: Record<NonNullable<IKpiItem['tone']>, string> = {
  default: 'text-primary',
  up: 'text-primary',
  down: 'text-primary',
  warning: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
  gold: 'text-primary',
};

const HINT_SURFACE: Record<NonNullable<IKpiItem['tone']>, string> = {
  default: 'bg-background/40 text-secondary',
  up: 'bg-success/12 text-success',
  down: 'bg-danger/12 text-danger',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  success: 'bg-success/12 text-success',
  gold: 'bg-primary/12 text-primary',
};

const DEFAULT_ACCENT = 'bg-primary/15 text-primary ring-primary/25';

export function KpiGrid({ items, className }: IKpiGridProps) {
  const resolveMoney = useResolveMoney();
  const resolveWeight = useResolveWeight();

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {items.map((item) => {
        const tone = item.tone ?? 'default';
        return (
          <article key={item.id} className="zarva-glass-card zarva-metric-card">
            <div className="zarva-metric-card__header">
              <div className="flex min-w-0 items-center gap-3">
                {item.icon ? (
                  <span
                    className={cn(
                      'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
                      item.accent ?? DEFAULT_ACCENT,
                    )}
                  >
                    <Icon name={item.icon} className="text-lg" />
                  </span>
                ) : null}
                <p className="min-w-0 truncate text-sm font-bold leading-none tracking-tight text-foreground">
                  {item.label}
                </p>
              </div>
            </div>

            <div className="zarva-metric-card__footer">
              <div className="zarva-metric-card__footer-row">
                <p
                  className={cn(
                    'zarva-num min-w-0 truncate text-[1.65rem] font-semibold leading-none tracking-tight',
                    VALUE_TONE[tone],
                  )}
                >
                  {resolveWeight(resolveMoney(item.value))}
                </p>
                {item.hint ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular-nums',
                      HINT_SURFACE[tone],
                    )}
                  >
                    {item.hint}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
