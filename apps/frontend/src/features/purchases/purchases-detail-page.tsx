'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { Button } from '@/components/ui/button';
import type { IPurchaseRow } from '@zarva/shared';

interface IProps {
  readonly row: IPurchaseRow;
  readonly chrome?: 'full' | 'body';
}

export function PurchasesDetailPage({ row, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.purchases');
  const locale = useLocale();
  const isBody = chrome === 'body';

  const body = (
    <>
      <PageHeader
        title={row.number}
        description={row.supplier}
        action={
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/purchases`}>{t('nav.list')}</Link>
          </Button>
        }
      />
      <KpiGrid
        className="mb-4"
        items={[
          {
            id: 'weight',
            label: t('cols.weight'),
            value: row.goldWeight,
            icon: 'scale-bold',
            accent: 'bg-info/15 text-info ring-info/25',
          },
          {
            id: 'amount',
            label: t('cols.amount'),
            value: row.amount,
            icon: 'delivery-bold',
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
        ]}
      />
      <DashboardPanel
        title={t('cols.date')}
        icon="clipboard-list-bold"
        accent="bg-primary/15 text-primary ring-primary/25"
      >
        <p className="text-sm text-foreground">{row.date}</p>
      </DashboardPanel>
    </>
  );

  if (isBody) return body;
  return <AppShell title={row.number}>{body}</AppShell>;
}
