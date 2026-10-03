import type { ReactNode } from 'react';

export interface IDataColumn<T> {
  readonly id: string;
  readonly header: string;
  readonly cell: (row: T) => ReactNode;
  readonly className?: string;
}

interface IDataTableProps<T> {
  readonly columns: ReadonlyArray<IDataColumn<T>>;
  readonly rows: ReadonlyArray<T>;
  readonly rowKey: (row: T) => string;
  readonly empty?: ReactNode;
  readonly footer?: ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, empty, footer }: IDataTableProps<T>) {
  if (!rows.length && empty) {
    return <>{empty}</>;
  }

  return (
    <div className="zarva-glass-card flex min-h-0 flex-col">
      <div className="min-h-0 overflow-x-auto zarva-scrollbar">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-nested text-muted-fg">
            <tr>
              {columns.map((col) => (
                <th key={col.id} className={`px-4 py-3 text-start font-medium ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border/50 hover:bg-hover/40">
                {columns.map((col) => (
                  <td key={col.id} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
