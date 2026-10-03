import { Shimmer } from '@/components/page/skeleton-primitives';
import { Icon } from '@/components/ui/icon';

/** Mirrors RolesWorkspace shell — static chrome, shimmer matrix cells. */
export function RolesBodySkeleton({
  title,
}: {
  readonly title: string;
}) {
  return (
    <section className="zarva-glass-card p-4 sm:p-5" aria-busy="true">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning ring-1 ring-warning/25">
          <Icon name="shield-keyhole-bold" className="text-lg leading-none" />
        </span>
        <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} className="flex items-center gap-3 border-b border-border/50 pb-3">
            <Shimmer className="h-3.5 w-28 shrink-0" />
            <div className="flex flex-1 flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, c) => (
                <Shimmer key={c} className="size-5 rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
