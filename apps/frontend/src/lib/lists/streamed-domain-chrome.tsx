import { Suspense, type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import type { IconName } from '@/components/ui/icon';
import { AppShell } from '@/features/shell/app-shell';
import { findModuleSubnav } from '@/features/shell/module-subnavs';
import {
  DomainBodySkeleton,
  type DomainBodySkeletonVariant,
} from '@/lib/lists/domain-page-skeleton';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import type { ISkeletonKpi } from '@/lib/lists/skeleton-kpi';

interface IHubTileSkeleton {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  readonly accent: string;
}

interface IProps {
  readonly messageNs: string;
  readonly titlePath?: string;
  readonly descriptionPath?: string;
  readonly pathForNav?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly showHeader?: boolean;
  /** Faithful KPI slots (icon + accent + label). Prefer over skeletonKpiLabels. */
  readonly skeletonKpis?: ReadonlyArray<ISkeletonKpi>;
  /** @deprecated Prefer skeletonKpis */
  readonly skeletonKpiLabels?: ReadonlyArray<string>;
  readonly skeletonSearchPlaceholder?: string;
  readonly skeletonColumnHeaders?: ReadonlyArray<string>;
  readonly skeletonHubTiles?: ReadonlyArray<IHubTileSkeleton>;
  readonly skeletonFormTitle?: string;
  readonly skeletonFormIcon?: IconName;
  readonly skeletonFormFields?: ReadonlyArray<{ readonly label: string }>;
  readonly skeletonVariant?: DomainBodySkeletonVariant;
  readonly skeletonFallback?: ReactNode;
}

/** Page chrome (title / tabs / action) around domain body — body streams via Suspense. */
export async function StreamedDomainChrome({
  messageNs,
  titlePath = 'title',
  descriptionPath = 'description',
  pathForNav,
  action,
  children,
  showHeader = true,
  skeletonKpis,
  skeletonKpiLabels,
  skeletonSearchPlaceholder,
  skeletonColumnHeaders,
  skeletonHubTiles,
  skeletonFormTitle,
  skeletonFormIcon,
  skeletonFormFields,
  skeletonVariant = 'list',
  skeletonFallback,
}: IProps) {
  const t = await getTranslations(messageNs);
  const title = t(titlePath);
  const description = t.has(descriptionPath) ? t(descriptionPath) : undefined;
  const moduleSlug = messageNs.replace(/^modules\./, '').split('.')[0] ?? '';
  const navPath = pathForNav ?? `/${moduleSlug}`;
  const navDef = findModuleSubnav(navPath);

  const navItems = navDef
    ? navDef.items.map((item) => ({
        href: item.href,
        label: t(item.key),
      }))
    : null;

  const fallback =
    skeletonFallback ??
    (skeletonVariant === 'list' ? (
      <DomainListBodySkeleton
        skeletonKpis={skeletonKpis}
        kpiLabels={skeletonKpiLabels}
        searchPlaceholder={skeletonSearchPlaceholder}
        columnHeaders={skeletonColumnHeaders}
      />
    ) : (
      <DomainBodySkeleton
        variant={skeletonVariant}
        skeletonKpis={skeletonKpis}
        kpiLabels={skeletonKpiLabels}
        searchPlaceholder={skeletonSearchPlaceholder}
        columnHeaders={skeletonColumnHeaders}
        hubTiles={skeletonHubTiles}
        formTitle={skeletonFormTitle}
        formIcon={skeletonFormIcon}
        formFields={skeletonFormFields}
      />
    ));

  return (
    <AppShell title={title}>
      {showHeader ? (
        <PageHeader title={title} description={description} action={action} />
      ) : null}
      {navItems ? <SubNav items={navItems} /> : null}
      <Suspense fallback={fallback}>{children}</Suspense>
    </AppShell>
  );
}
