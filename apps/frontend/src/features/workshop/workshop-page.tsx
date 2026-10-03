'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import type { IWorkshopOrderRow } from '@zarva/shared';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly rows: ReadonlyArray<IWorkshopOrderRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function WorkshopPage({
  rows,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.workshop');
  const late = rows.filter((r) => r.progress < 50).length;
  return (
    <DomainListPage<IWorkshopOrderRow>
      chrome={chrome}
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'open',
          label: t('kpi.open'),
          value: String(rows.length),
          icon: 'settings-minimalistic-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
        {
          id: 'late',
          label: t('kpi.late'),
          value: String(late),
          tone: late > 0 ? 'danger' : 'default',
          icon: 'danger-triangle-bold',
          accent:
            late > 0
              ? 'bg-danger/15 text-danger ring-danger/25'
              : 'bg-warning/15 text-warning ring-warning/25',
        },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/workshop', label: t('nav.orders') },
            { href: '/workshop/production', label: t('nav.production') },
            { href: '/workshop/artisans', label: t('nav.artisans') },
          ]}
        />
      }
      columns={[
        { id: 'order', header: t('cols.order'), cell: (r) => r.order },
        { id: 'customer', header: t('cols.customer'), cell: (r) => r.customer },
        { id: 'product', header: t('cols.product'), cell: (r) => r.product },
        { id: 'artisan', header: t('cols.artisan'), cell: (r) => r.artisan },
        { id: 'due', header: t('cols.due'), cell: (r) => r.due },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge
              label={r.status}
              tone={r.progress < 50 ? 'danger' : 'warning'}
              icon={r.progress < 50 ? 'danger-triangle-bold' : 'clock-circle-bold'}
            />
          ),
        },
        {
          id: 'progress',
          header: t('cols.progress'),
          cell: (r) => (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded bg-muted">
                <div className="h-full bg-primary" style={{ width: `${r.progress}%` }} />
              </div>
              <span className="tabular-nums text-xs">{r.progress}%</span>
            </div>
          ),
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="flame-bold"
      emptyAccent="bg-warning/15 text-warning ring-warning/25"
    />
  );
}
