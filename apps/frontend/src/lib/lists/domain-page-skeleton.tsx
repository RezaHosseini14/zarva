import { PageHeader } from '@/components/page/page-header';
import {
  MetricCardHeader,
  MetricCardShell,
  Shimmer,
} from '@/components/page/skeleton-primitives';
import { Icon, type IconName } from '@/components/ui/icon';
import { AppShell } from '@/features/shell/app-shell';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import type { ISkeletonKpi } from '@/lib/lists/skeleton-kpi';
import { cn } from '@/lib/utils';

interface IDomainPageSkeletonProps {
  readonly title: string;
  readonly description?: string;
  readonly variant?: DomainBodySkeletonVariant;
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  readonly kpiLabels?: ReadonlyArray<string>;
  readonly searchPlaceholder?: string;
  readonly columnHeaders?: ReadonlyArray<string>;
  readonly hubTiles?: ReadonlyArray<IHubTileSkeleton>;
  readonly formTitle?: string;
  readonly formIcon?: IconName;
  readonly formFields?: ReadonlyArray<IFormFieldLabel>;
}

interface IFormFieldLabel {
  readonly label: string;
}

interface IHubTileSkeleton {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly accent: string;
}

const VALUE_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28'] as const;
const CHIP_WIDTHS = ['w-14', 'w-16', 'w-12', 'w-14'] as const;
const DEFAULT_ACCENT = 'bg-primary/15 text-primary ring-primary/25';

/** Form body under StreamedDomainChrome — real labels, shimmer inputs. */
export function DomainFormBodySkeleton({
  title,
  icon = 'settings-bold',
  fields = [],
  accent = DEFAULT_ACCENT,
}: {
  readonly title?: string;
  readonly icon?: IconName;
  readonly fields?: ReadonlyArray<IFormFieldLabel>;
  readonly accent?: string;
}) {
  const rows = fields.length > 0 ? fields : [{ label: '' }, { label: '' }];

  return (
    <section className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6" aria-busy="true">
      {title ? (
        <div className="mb-1 flex items-center gap-3">
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
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((field, i) => (
          <label key={`${field.label}-${i}`} className="flex flex-col gap-1.5 text-sm">
            {field.label ? (
              <span className="text-secondary">{field.label}</span>
            ) : (
              <Shimmer className="h-3.5 w-20" />
            )}
            <Shimmer className="h-10 w-full rounded-md" />
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Shimmer className="h-9 w-20 rounded-md" />
        <Shimmer className="h-9 w-24 rounded-md" />
      </div>
    </section>
  );
}

/** Hub body — KPI shells + ready hub tiles (titles/icons already known). */
export function DomainHubBodySkeleton({
  skeletonKpis,
  kpiLabels,
  hubTiles = [],
}: {
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  readonly kpiLabels?: ReadonlyArray<string>;
  readonly hubTiles?: ReadonlyArray<IHubTileSkeleton>;
}) {
  const kpis: ReadonlyArray<ISkeletonKpi> =
    skeletonKpis && skeletonKpis.length > 0
      ? skeletonKpis
      : (kpiLabels ?? []).map((label) => ({
          label,
          icon: 'chart-bold' as const,
          accent: DEFAULT_ACCENT,
        }));

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

      {hubTiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {hubTiles.map((tile) => (
            <div
              key={tile.title}
              className="zarva-glass-card relative flex items-center gap-3 px-3.5 py-3"
            >
              <span
                className={cn(
                  'relative inline-flex size-9 shrink-0 items-center justify-center rounded-[0.85rem] ring-1',
                  'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]',
                  tile.accent,
                )}
              >
                <Icon name={tile.icon} className="text-lg" />
              </span>
              <div className="relative min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-none tracking-tight text-foreground">
                  {tile.title}
                </span>
                <p className="mt-1.5 line-clamp-1 text-xs leading-snug text-secondary">
                  {tile.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DomainListBodySkeleton skeletonKpis={[]} kpiOnly />
      )}
    </>
  );
}

/** Insights cards — shell ready, body shimmer. */
export function DomainInsightsBodySkeleton({
  count = 4,
}: {
  readonly count?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <article key={i} className="zarva-glass-card p-4">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="mt-3 h-3 w-full" />
          <Shimmer className="mt-2 h-3 w-40" />
          <Shimmer className="mt-4 h-3 w-20" />
        </article>
      ))}
    </div>
  );
}

export type DomainBodySkeletonVariant = 'list' | 'form' | 'hub' | 'insights';

/** Body-only skeleton dispatcher for StreamedDomainChrome Suspense fallbacks. */
export function DomainBodySkeleton({
  variant = 'list',
  skeletonKpis,
  kpiLabels,
  searchPlaceholder,
  columnHeaders,
  hubTiles,
  formTitle,
  formIcon,
  formFields,
}: {
  readonly variant?: DomainBodySkeletonVariant;
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  readonly kpiLabels?: ReadonlyArray<string>;
  readonly searchPlaceholder?: string;
  readonly columnHeaders?: ReadonlyArray<string>;
  readonly hubTiles?: ReadonlyArray<IHubTileSkeleton>;
  readonly formTitle?: string;
  readonly formIcon?: IconName;
  readonly formFields?: ReadonlyArray<IFormFieldLabel>;
}) {
  if (variant === 'form') {
    return (
      <DomainFormBodySkeleton
        title={formTitle}
        icon={formIcon}
        fields={formFields}
      />
    );
  }
  if (variant === 'hub') {
    return (
      <DomainHubBodySkeleton
        skeletonKpis={skeletonKpis}
        kpiLabels={kpiLabels}
        hubTiles={hubTiles}
      />
    );
  }
  if (variant === 'insights') {
    return <DomainInsightsBodySkeleton />;
  }
  return (
    <DomainListBodySkeleton
      skeletonKpis={skeletonKpis}
      kpiLabels={kpiLabels}
      searchPlaceholder={searchPlaceholder}
      columnHeaders={columnHeaders}
    />
  );
}

/**
 * Full-page chrome + body skeleton.
 * Never put inside Suspense — use DomainBodySkeleton / DomainListBodySkeleton instead.
 */
export function DomainPageSkeleton({
  title,
  description,
  variant = 'list',
  skeletonKpis,
  kpiLabels,
  searchPlaceholder,
  columnHeaders,
  hubTiles,
  formTitle,
  formIcon,
  formFields,
}: IDomainPageSkeletonProps) {
  return (
    <AppShell title={title}>
      <PageHeader title={title} description={description} />
      <DomainBodySkeleton
        variant={variant}
        skeletonKpis={skeletonKpis}
        kpiLabels={kpiLabels}
        searchPlaceholder={searchPlaceholder}
        columnHeaders={columnHeaders}
        hubTiles={hubTiles}
        formTitle={formTitle}
        formIcon={formIcon}
        formFields={formFields}
      />
    </AppShell>
  );
}
