import { SIDEBAR_NAV_GROUPS } from '@zarva/shared';

const ROW_COUNTS = [3, 5, 2, 1, 4] as const;

/** Sidebar-only shimmer — mirrors group labels + link rows. */
export function SidebarNavSkeleton() {
  return (
    <div
      className="zarva-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-3"
      aria-hidden
    >
      {SIDEBAR_NAV_GROUPS.map((group, gi) => (
        <div key={group.id}>
          <div className="mb-2 px-3">
            <div className="zarva-shimmer h-3 w-16 rounded" />
          </div>
          <div className="space-y-1">
            {Array.from({ length: ROW_COUNTS[gi] ?? 3 }).map((_, i) => (
              <div
                key={`${group.id}-${i}`}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3"
              >
                <div className="zarva-shimmer size-5 shrink-0 rounded" />
                <div className="zarva-shimmer h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
