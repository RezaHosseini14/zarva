import { cn } from '@/lib/utils';

interface IVersionSemverLabelProps {
  readonly version: string;
  readonly className?: string;
  readonly prefixClassName?: string;
  readonly size?: 'sm' | 'md';
}

/** Latin semver digits — avoids Persian shaping from Yekan Bakh. */
export function VersionSemverLabel({
  version,
  className,
  prefixClassName,
  size = 'md',
}: IVersionSemverLabelProps) {
  const segments = version.split('.');

  return (
    <span
      lang="en"
      dir="ltr"
      translate="no"
      className={cn(
        'zarva-version-num inline-flex items-baseline gap-1',
        size === 'sm' ? 'text-[11px]' : 'text-[13px]',
        className,
      )}
    >
      <span
        className={cn(
          'rounded-sm bg-primary/15 px-1 py-px font-bold uppercase tracking-[0.22em] text-primary/90',
          size === 'sm' ? 'text-[8px]' : 'text-[9px]',
          prefixClassName,
        )}
        aria-hidden
      >
        v
      </span>
      <span className="inline-flex items-baseline gap-px font-semibold tracking-tight text-primary">
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="inline-flex items-baseline">
            {index > 0 ? (
              <span className="px-px font-normal text-primary/45" aria-hidden>
                .
              </span>
            ) : null}
            <span className="tabular-nums">{segment}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
