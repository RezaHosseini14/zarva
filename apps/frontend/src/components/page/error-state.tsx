import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface IErrorStateProps {
  readonly title: string;
  readonly description?: string;
  readonly retryLabel?: string;
  readonly onRetry?: () => void;
  /** Compact layout for popovers / dialogs / inline strips. */
  readonly compact?: boolean;
  readonly className?: string;
}

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  compact = false,
  className,
}: IErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center text-center',
        compact
          ? 'gap-2 px-3 py-6'
          : 'zarva-glass-card gap-0 border-danger/35 bg-danger/10 px-6 py-10',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xl ring-1',
          'bg-danger/15 text-danger ring-danger/25',
          compact ? 'mb-1 size-9' : 'mb-4 size-10',
        )}
        aria-hidden
      >
        <Icon name="danger-triangle-bold" className={compact ? 'text-base' : 'text-lg'} />
      </span>
      <h3
        className={cn(
          'font-medium text-danger',
          compact ? 'text-sm' : 'text-base',
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            'text-secondary',
            compact ? 'mt-1 max-w-[16rem] text-xs leading-relaxed' : 'mt-2 max-w-md text-sm leading-relaxed',
          )}
        >
          {description}
        </p>
      ) : null}
      {retryLabel && onRetry ? (
        <Button
          type="button"
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={onRetry}
          className={cn('gap-2', compact ? 'mt-3' : 'mt-5')}
        >
          <Icon name="refresh-bold" className="text-base" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
