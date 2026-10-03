'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type IDataColumn } from '@/components/page/data-table';
import { EmptyState } from '@/components/page/empty-state';
import { ErrorState } from '@/components/page/error-state';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';

interface INotificationsTablePanelProps<T> {
  readonly isError: boolean;
  readonly errorTitle: string;
  readonly onRetry: () => void;
  readonly columns: ReadonlyArray<IDataColumn<T>>;
  readonly rows: ReadonlyArray<T>;
  readonly rowKey: (row: T) => string;
  readonly emptyIcon: IconName;
  readonly emptyAccent: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly total: number;
  readonly footerExtra?: ReactNode;
}

/** Table only — page-level Suspense owns first paint skeleton. */
export function NotificationsTablePanel<T>({
  isError,
  errorTitle,
  onRetry,
  columns,
  rows,
  rowKey,
  emptyIcon,
  emptyAccent,
  emptyTitle,
  emptyDescription,
  total,
  footerExtra,
}: INotificationsTablePanelProps<T>) {
  const tCommon = useTranslations('common');

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        description={tCommon('sectionErrorDescription')}
        retryLabel={tCommon('retry')}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ minHeight: 'calc(100dvh - 20rem)' }}
    >
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        empty={
          <EmptyState
            icon={emptyIcon}
            accent={emptyAccent}
            title={emptyTitle}
            description={emptyDescription}
          />
        }
        footer={
          <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-fg">
            <span>
              {tCommon('total')}{' '}
              <span className="zarva-num text-secondary">{total}</span>
              {footerExtra}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" disabled>
                {tCommon('prev')}
              </Button>
              <Button type="button" variant="ghost" size="sm" disabled>
                {tCommon('next')}
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
