'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid, type IKpiItem } from '@/components/page/kpi-grid';
import { FilterSearch } from '@/components/page/filter-bar';
import { DataTable, type IDataColumn } from '@/components/page/data-table';
import { EmptyState } from '@/components/page/empty-state';
import { ErrorState } from '@/components/page/error-state';
import { SectionBoundary } from '@/components/page/section-boundary';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { IconName } from '@/components/ui/icon';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IDomainListPageProps<T> {
  readonly shellTitle: string;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly kpis: ReadonlyArray<IKpiItem>;
  readonly searchPlaceholder: string;
  readonly columns: ReadonlyArray<IDataColumn<T>>;
  readonly rows: ReadonlyArray<T>;
  readonly rowKey: (row: T) => string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly emptyIcon?: IconName;
  readonly emptyAccent?: string;
  readonly emptyActionLabel?: string;
  readonly onEmptyAction?: () => void;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly errorTitle?: string;
  readonly errorDescription?: string;
  readonly onRetry?: () => void;
  readonly extraFilters?: ReactNode;
  readonly footer?: ReactNode;
  readonly belowToolbar?: ReactNode;
  /** Rendered under the table section (e.g. detail / assign panels). */
  belowTable?: ReactNode;
  /** `body` skips shell/header for use inside `StreamedDomainChrome`. */
  readonly chrome?: 'full' | 'body';
}

/** Domain list layout — KPI + search + typed table (not a generic Sample shell). */
export function DomainListPage<T>({
  shellTitle,
  title,
  description,
  action,
  kpis,
  searchPlaceholder,
  columns,
  rows,
  rowKey,
  emptyTitle,
  emptyDescription,
  emptyIcon = 'box-bold',
  emptyAccent,
  emptyActionLabel,
  onEmptyAction,
  isError = false,
  errorKind,
  errorTitle,
  errorDescription,
  onRetry,
  extraFilters,
  footer,
  belowToolbar,
  belowTable,
  chrome = 'full',
}: IDomainListPageProps<T>) {
  const t = useTranslations('common');
  const isBody = chrome === 'body';
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      try {
        return JSON.stringify(row).toLowerCase().includes(q);
      } catch {
        return true;
      }
    });
  }, [rows, search]);

  const body = (
    <>
      {isBody ? null : <PageHeader title={title} description={description} action={action} />}
      <KpiGrid items={kpis} className="mb-4" />
      {extraFilters ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <FilterSearch
            placeholder={searchPlaceholder}
            value={search}
            onChange={setSearch}
          />
          {extraFilters}
        </div>
      ) : (
        <FilterSearch
          placeholder={searchPlaceholder}
          className="mb-4"
          value={search}
          onChange={setSearch}
        />
      )}
      {belowToolbar}
      <SectionBoundary>
        {isError ? (
          errorKind || (!errorTitle && !errorDescription) ? (
            <SectionLoadError kind={errorKind} />
          ) : (
            <ErrorState
              title={errorTitle ?? t('sectionErrorTitle')}
              description={errorDescription ?? t('sectionErrorDescription')}
              retryLabel={onRetry ? t('retry') : undefined}
              onRetry={onRetry}
            />
          )
        ) : (
          <DataTable
            columns={columns}
            rows={filteredRows}
            rowKey={rowKey}
            empty={
              <EmptyState
                icon={emptyIcon}
                accent={emptyAccent}
                title={emptyTitle}
                description={emptyDescription}
                actionLabel={emptyActionLabel}
                onAction={onEmptyAction}
              />
            }
            footer={footer}
          />
        )}
      </SectionBoundary>
      {belowTable}
    </>
  );

  if (isBody) {
    return body;
  }

  return <AppShell title={shellTitle}>{body}</AppShell>;
}
