import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const DEFAULT_ACCENT = 'bg-primary/15 text-primary ring-primary/25';

interface IEmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly accent?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly className?: string;
  /** Standalone glass card (search, reports). Off inside DataTable. */
  readonly bordered?: boolean;
}

export function EmptyState({
  title,
  description,
  icon = 'box-bold',
  accent = DEFAULT_ACCENT,
  actionLabel,
  onAction,
  className,
  bordered = false,
}: IEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center sm:py-16',
        bordered && 'zarva-glass-card',
        className,
      )}
    >
      <span
        className={cn(
          'mb-5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
          accent,
        )}
        aria-hidden
      >
        <Icon name={icon} className="text-lg" />
      </span>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-secondary">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
