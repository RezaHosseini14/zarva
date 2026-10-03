import { Shimmer } from '@/components/page/skeleton-primitives';

interface ISessionListSkeletonProps {
  readonly rows?: number;
}

/** Matches session / device / history glass-card row lists. */
export function SessionListSkeleton({ rows = 5 }: ISessionListSkeletonProps) {
  return (
    <ul
      className="zarva-glass-card divide-y divide-border overflow-hidden p-0"
      aria-busy="true"
    >
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Shimmer className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Shimmer className="h-3.5 w-40 max-w-full" />
              <Shimmer className="h-3 w-28 max-w-full" />
            </div>
          </div>
          <Shimmer className="h-8 w-24 shrink-0 rounded-md" />
        </li>
      ))}
    </ul>
  );
}
