import {
  MetricCardHeader,
  MetricCardShell,
  Shimmer,
} from '@/components/page/skeleton-primitives';
import type { ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

const VALUE_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28'] as const;
const CHIP_WIDTHS = ['w-14', 'w-16', 'w-12', 'w-14'] as const;

interface IDomainListBodySkeletonProps {
  /** Prefer this — exact icon/accent/label match to live KpiGrid. */
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  /** @deprecated Use skeletonKpis so icons cannot drift. */
  readonly kpiLabels?: ReadonlyArray<string>;
  readonly searchPlaceholder?: string;
  readonly columnHeaders?: ReadonlyArray<string>;
  readonly columnCount?: number;
  readonly rowCount?: number;
  /** KPI strip only (hub pages). */
  readonly kpiOnly?: boolean;
}

/** Body under StreamedDomainChrome — mirrors DomainListPage (KPI + filter + table). */
export function DomainListBodySkeleton({
  skeletonKpis,
  kpiLabels,
  searchPlaceholder,
  columnHeaders,
  columnCount,
  rowCount = 6,
  kpiOnly = false,
}: IDomainListBodySkeletonProps) {
  const kpis: ReadonlyArray<ISkeletonKpi> =
    skeletonKpis && skeletonKpis.length > 0
      ? skeletonKpis
      : (kpiLabels ?? []).map((label) => ({
          label,
          icon: 'chart-bold' as const,
          accent: 'bg-primary/15 text-primary ring-primary/25',
        }));

  const cols =
    columnHeaders && columnHeaders.length > 0
      ? columnHeaders
      : kpiOnly
        ? []
        : Array.from({ length: columnCount ?? 5 }, () => '');

  return (
    <>
      {kpis.length > 0 ? (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi, i) => (
            <MetricCardShell
              key={`kpi-${kpi.label}-${i}`}
              valueWidth={VALUE_WIDTHS[i % VALUE_WIDTHS.length] ?? 'w-28'}
              chipWidth={CHIP_WIDTHS[i % CHIP_WIDTHS.length] ?? 'w-14'}
              header={
                <MetricCardHeader icon={kpi.icon} accent={kpi.accent} label={kpi.label} />
              }
            />
          ))}
        </div>
      ) : null}

      {kpiOnly ? null : searchPlaceholder !== undefined ? (
        <div className="mb-4 w-full">
          {searchPlaceholder ? (
            <div
              className="zarva-glass-input flex h-10 w-full items-center rounded-md px-3 text-sm text-muted-fg"
              aria-hidden
            >
              {searchPlaceholder}
            </div>
          ) : (
            <Shimmer className="h-10 w-full rounded-md" />
          )}
        </div>
      ) : null}

      {kpiOnly || cols.length === 0 ? null : (
        <div className="zarva-glass-card flex min-h-0 flex-col" aria-busy="true">
          <div className="min-h-0 overflow-x-auto zarva-scrollbar">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-nested text-muted-fg">
                <tr>
                  {cols.map((header, i) => (
                    <th key={i} className="px-4 py-3 text-start font-medium">
                      {header ? (
                        <span className="text-muted-fg">{header}</span>
                      ) : (
                        <Shimmer className="h-3 w-16" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }, (_, r) => (
                  <tr key={r} className="border-b border-border/50">
                    {cols.map((_, c) => (
                      <td key={c} className="px-4 py-3">
                        <Shimmer
                          className={
                            c === 0
                              ? 'h-3.5 w-24'
                              : c === cols.length - 1
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
      )}
    </>
  );
}
