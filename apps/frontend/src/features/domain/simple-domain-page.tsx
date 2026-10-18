'use client';

import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { HubCards } from '@/components/page/hub-cards';
import { KpiGrid, type IKpiItem } from '@/components/page/kpi-grid';
import { PageHeader } from '@/components/page/page-header';
import { SectionLoadError } from '@/components/page/section-load-error';
import { Icon, type IconName } from '@/components/ui/icon';
import { AppShell } from '@/features/shell/app-shell';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import { ACCENT } from '@/lib/lists/skeleton-kpi';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IHubLink {
  readonly path: string;
  readonly titleKey: string;
  readonly descKey: string;
  readonly icon?: IconName;
  readonly accent?: string;
}

interface IProps {
  readonly moduleKey: string;
  readonly rows: ReadonlyArray<IRow>;
  readonly variant?: 'table' | 'hub' | 'insights';
  readonly hubLinks?: ReadonlyArray<IHubLink>;
  readonly chrome?: 'full' | 'body';
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly kpiItems?: ReadonlyArray<IKpiItem>;
  /** When true, row a/b/c are display strings (not message keys). */
  readonly insightsRaw?: boolean;
}

function defaultKpis(
  t: (key: string) => string,
  kpiItems?: ReadonlyArray<IKpiItem>,
): ReadonlyArray<IKpiItem> {
  if (kpiItems && kpiItems.length > 0) return kpiItems;
  // Honest empty KPIs — never i18n fake aValue stubs for shipped modules.
  return [
    {
      id: '1',
      label: t('kpi.a'),
      value: '0',
      icon: 'chart-bold',
      accent: ACCENT.primary,
    },
    {
      id: '2',
      label: t('kpi.b'),
      value: '0',
      icon: 'clipboard-list-bold',
      accent: ACCENT.info,
    },
  ];
}

export function SimpleDomainPage({
  moduleKey,
  rows,
  variant = 'table',
  hubLinks,
  chrome = 'full',
  isError,
  errorKind,
  kpiItems,
  insightsRaw = false,
}: IProps) {
  const t = useTranslations(`modules.${moduleKey}`);
  const locale = useLocale();
  const isBody = chrome === 'body';
  const kpis = defaultKpis(t, kpiItems);

  if (variant === 'hub' && hubLinks) {
    const body = (
      <>
        {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
        {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
        <KpiGrid className="mb-4" items={kpis} />
        <HubCards
          items={hubLinks.map((l) => ({
            href: `/${locale}${l.path}`,
            title: t(l.titleKey),
            description: t(l.descKey),
            icon: (
              <Icon name={l.icon ?? 'layers-minimalistic-bold'} className="text-lg" />
            ),
            accent: l.accent ?? ACCENT.primary,
          }))}
        />
      </>
    );
    if (isBody) return body;
    return <AppShell title={t('title')}>{body}</AppShell>;
  }

  if (variant === 'insights') {
    const body = (
      <>
        {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
        {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <article key={r.id} className="zarva-glass-card p-4">
              <h3 className="font-medium text-primary">
                {insightsRaw ? r.a : t(r.a)}
              </h3>
              <p className="mt-2 text-sm text-secondary">
                {insightsRaw ? r.b : t(r.b)}
              </p>
              <p className="mt-3 text-xs text-muted-fg">
                {insightsRaw ? r.c : t(r.c)}
              </p>
            </article>
          ))}
        </div>
      </>
    );
    if (isBody) return body;
    return <AppShell title={t('title')}>{body}</AppShell>;
  }

  return (
    <DomainListPage<IRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={kpis}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.a'), cell: (r) => r.a },
        { id: 'b', header: t('cols.b'), cell: (r) => r.b },
        { id: 'c', header: t('cols.c'), cell: (r) => r.c },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="document-text-bold"
      emptyAccent={ACCENT.primary}
    />
  );
}
