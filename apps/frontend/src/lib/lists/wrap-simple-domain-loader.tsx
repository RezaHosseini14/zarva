import type { ReactNode } from 'react';

import type { IconName } from '@/components/ui/icon';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';
import type { DomainBodySkeletonVariant } from '@/lib/lists/domain-page-skeleton';
import type { ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface IWrapSimpleDomainLoaderProps {
  readonly moduleKey: string;
  readonly pathForNav?: string;
  readonly variant?: DomainBodySkeletonVariant;
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  readonly skeletonSearchPlaceholder?: string;
  readonly skeletonColumnHeaders?: ReadonlyArray<string>;
  readonly skeletonHubTiles?: ReadonlyArray<{
    readonly title: string;
    readonly description: string;
    readonly icon: IconName;
    readonly accent: string;
  }>;
  readonly children: ReactNode;
}

/** Chrome outside Suspense + body skeleton for SimpleDomainPage section loaders. */
export function WrapSimpleDomainLoader({
  moduleKey,
  pathForNav,
  variant = 'list',
  skeletonKpis,
  skeletonSearchPlaceholder,
  skeletonColumnHeaders,
  skeletonHubTiles,
  children,
}: IWrapSimpleDomainLoaderProps) {
  return (
    <StreamedDomainChrome
      messageNs={`modules.${moduleKey}`}
      pathForNav={pathForNav ?? `/${moduleKey}`}
      skeletonVariant={variant}
      skeletonKpis={skeletonKpis}
      skeletonSearchPlaceholder={skeletonSearchPlaceholder}
      skeletonColumnHeaders={skeletonColumnHeaders}
      skeletonHubTiles={skeletonHubTiles}
    >
      {children}
    </StreamedDomainChrome>
  );
}
