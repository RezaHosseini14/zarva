import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'gold';

interface IStatusBadgeProps {
  readonly label: ReactNode;
  readonly tone?: StatusTone;
  /** Required for table/status chips — Solar bold icon inside nested square. */
  readonly icon: IconName;
  readonly title?: string;
  readonly className?: string;
  /** When set, renders shadcn `Button` with the same chip chrome. */
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

const SHELL: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success ring-success/20',
  danger: 'bg-danger/10 text-danger ring-danger/25',
  warning: 'bg-warning/12 text-warning ring-warning/25',
  info: 'bg-info/12 text-info ring-info/25',
  neutral: 'bg-muted/80 text-secondary ring-border/60',
  gold: 'bg-primary/12 text-primary ring-primary/25',
};

const ICON_BOX: Record<StatusTone, string> = {
  success: 'bg-success/20 ring-success/30',
  danger: 'bg-danger/20 ring-danger/30',
  warning: 'bg-warning/20 ring-warning/30',
  info: 'bg-info/20 ring-info/30',
  neutral: 'bg-nested ring-border/70',
  gold: 'bg-primary/20 ring-primary/30',
};

const HOVER: Record<StatusTone, string> = {
  success: 'hover:bg-success/16',
  danger: 'hover:bg-danger/18 hover:ring-danger/40',
  warning: 'hover:bg-warning/18 hover:ring-warning/40',
  info: 'hover:bg-info/18 hover:ring-info/40',
  neutral: 'hover:bg-muted',
  gold: 'hover:bg-primary/18 hover:ring-primary/40',
};

const CHIP =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg pe-2.5 ps-1.5 text-xs font-medium ring-1 transition-colors';

/**
 * Canonical status / payment / read chip for tables and detail rows.
 * Span by default; pass `onClick` for a shadcn Button with the same look.
 */
export function StatusBadge({
  label,
  tone = 'neutral',
  icon,
  title,
  className,
  onClick,
  disabled,
}: IStatusBadgeProps) {
  const body = (
    <>
      <span
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-md ring-1',
          ICON_BOX[tone],
        )}
      >
        <Icon name={icon} className="text-[0.7rem]" />
      </span>
      <span className="whitespace-nowrap leading-none">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="default"
        title={title}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          CHIP,
          SHELL[tone],
          HOVER[tone],
          'border-0 shadow-none hover:text-inherit',
          className,
        )}
      >
        {body}
      </Button>
    );
  }

  return (
    <span title={title} className={cn(CHIP, SHELL[tone], className)}>
      {body}
    </span>
  );
}
