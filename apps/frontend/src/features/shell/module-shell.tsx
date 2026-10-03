'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/page/page-header';
import { EmptyState } from '@/components/page/empty-state';
import { Button } from '@/components/ui/button';

interface IModuleShellProps {
  readonly title: string;
  readonly description: string;
  readonly columns?: ReadonlyArray<string>;
  readonly newLabel?: string;
  readonly exportLabel?: string;
  readonly prevLabel?: string;
  readonly nextLabel?: string;
  readonly totalLabel?: string;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly showSampleRows?: boolean;
}

export function ModuleShell({
  title,
  description,
  columns,
  newLabel,
  exportLabel,
  prevLabel,
  nextLabel,
  totalLabel,
  emptyTitle,
  emptyDescription,
  showSampleRows = false,
}: IModuleShellProps) {
  const tShell = useTranslations('shell');
  const tCommon = useTranslations('common');

  const cols = columns ?? [
    tShell('colId'),
    tShell('colName'),
    tShell('colStatus'),
    tShell('colUpdated'),
  ];
  const labelNew = newLabel ?? tCommon('new');
  const labelExport = exportLabel ?? tCommon('export');
  const labelPrev = prevLabel ?? tCommon('prev');
  const labelNext = nextLabel ?? tCommon('next');
  const labelTotal = totalLabel ?? tCommon('total');

  return (
    <div className="flex min-h-[60vh] flex-col">
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost">
              {labelExport}
            </Button>
            <Button type="button">{labelNew}</Button>
          </div>
        }
      />
      <div className="zarva-glass-card flex min-h-0 flex-1 flex-col">
        {showSampleRows ? (
          <>
            <div className="min-h-0 overflow-x-auto zarva-scrollbar">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-nested text-muted-fg">
                  <tr>
                    {cols.map((col) => (
                      <th key={col} className="px-4 py-3 text-start font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="border-b border-border/50 hover:bg-hover/60">
                      {cols.map((col, i) => (
                        <td key={col} className="px-4 py-3 text-secondary">
                          {i === 0 ? (
                            <span className="zarva-num text-muted-fg">#{String(row).padStart(3, '0')}</span>
                          ) : i === cols.length - 1 ? (
                            '—'
                          ) : (
                            `${col} ${row}`
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-fg">
              <span>
                {labelTotal} <span className="zarva-num text-secondary">3</span>
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm">
                  {labelPrev}
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  {labelNext}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon="clipboard-list-bold"
            title={emptyTitle ?? tShell('emptyTitle')}
            description={emptyDescription ?? tShell('emptyDescription')}
          />
        )}
      </div>
    </div>
  );
}
