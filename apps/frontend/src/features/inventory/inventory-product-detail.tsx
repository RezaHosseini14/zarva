'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StatusBadge } from '@/components/page/status-badge';
import { KpiGrid } from '@/components/page/kpi-grid';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { Button } from '@/components/ui/button';
import type { IInventoryRow } from '@zarva/shared';

interface IProps {
  readonly row: IInventoryRow;
  readonly chrome?: 'full' | 'body';
}

export function InventoryProductDetailPage({ row, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.inventory');
  const locale = useLocale();
  const isBody = chrome === 'body';

  const body = (
    <>
      <PageHeader
        title={row.name}
        description={row.sku}
        action={
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/inventory`}>{t('nav.overview')}</Link>
          </Button>
        }
      />
      <KpiGrid
        className="mb-4"
        items={[
          {
            id: 'weight',
            label: t('cols.weight'),
            value: row.weight,
            icon: 'scale-bold',
            accent: 'bg-info/15 text-info ring-info/25',
          },
          {
            id: 'purity',
            label: t('cols.purity'),
            value: row.purity,
            icon: 'medal-star-bold',
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
          {
            id: 'value',
            label: t('cols.value'),
            value: row.value,
            icon: 'dollar-bold',
            accent: 'bg-success/15 text-success ring-success/25',
          },
        ]}
      />
      <DashboardPanel
        title={t('cols.status')}
        icon="box-bold"
        accent="bg-warning/15 text-warning ring-warning/25"
      >
        <StatusBadge
          label={t(`status.${row.status}`)}
          tone={
            row.status === 'low' ? 'danger' : row.status === 'available' ? 'success' : 'warning'
          }
          icon={
            row.status === 'low'
              ? 'danger-triangle-bold'
              : row.status === 'available'
                ? 'check-read-bold'
                : 'box-bold'
          }
        />
      </DashboardPanel>
    </>
  );

  if (isBody) return body;
  return <AppShell title={row.name}>{body}</AppShell>;
}
