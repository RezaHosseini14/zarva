import { Shimmer } from '@/components/page/skeleton-primitives';

interface IDataTableSkeletonProps {
  readonly columnCount?: number;
  readonly rowCount?: number;
}

/** Glass-card table body only — for client list pages with chrome already shown. */
export function DataTableSkeleton({
  columnCount = 4,
  rowCount = 8,
}: IDataTableSkeletonProps) {
  return (
    <div className="zarva-glass-card flex min-h-0 flex-1 flex-col" aria-busy="true">
      <div className="min-h-0 overflow-x-auto zarva-scrollbar">
        <table className="w-full min-w-160 text-sm">
          <thead className="border-b border-border bg-nested text-muted-fg">
            <tr>
              {Array.from({ length: columnCount }, (_, i) => (
                <th key={i} className="px-4 py-3 text-start font-medium">
                  <Shimmer className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, r) => (
              <tr key={r} className="border-b border-border/50">
                {Array.from({ length: columnCount }, (_, c) => (
                  <td key={c} className="px-4 py-3">
                    <Shimmer
                      className={
                        c === 0
                          ? 'h-3.5 w-24'
                          : c === columnCount - 1
                            ? 'h-3.5 w-14'
                            : 'h-3.5 w-20'
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
