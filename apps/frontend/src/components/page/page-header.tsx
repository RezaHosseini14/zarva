import type { ReactNode } from 'react';

interface IPageHeaderProps {
  readonly title: string;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly breadcrumb?: ReactNode;
}

/** In-page title + optional description + action slot (use `Button` for CTAs). */
export function PageHeader({ title, description, action, breadcrumb }: IPageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex flex-col gap-1">
        {breadcrumb}
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        {description ? (
          typeof description === 'string' ? (
            <p className="max-w-2xl text-sm text-secondary">{description}</p>
          ) : (
            <div className="max-w-2xl text-sm text-secondary">{description}</div>
          )
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}
