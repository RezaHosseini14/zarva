import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface IDashboardPanelProps {
  readonly title: string;
  readonly icon: IconName;
  readonly accent?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly bodyClassName?: string;
  readonly headerClassName?: string;
}

const DEFAULT_ACCENT = 'bg-primary/15 text-primary ring-primary/25';

export function DashboardPanel({
  title,
  icon,
  accent = DEFAULT_ACCENT,
  children,
  className,
  bodyClassName,
  headerClassName,
}: IDashboardPanelProps) {
  return (
    <section className={cn('zarva-glass-card p-4 sm:p-5', className)}>
      <div className={cn('mb-4 flex items-center gap-3', headerClassName)}>
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
            accent,
          )}
        >
          <Icon name={icon} className="text-lg leading-none" />
        </span>
        <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className={cn('min-h-0', bodyClassName)}>{children}</div>
    </section>
  );
}
