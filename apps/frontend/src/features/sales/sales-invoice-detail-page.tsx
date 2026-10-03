'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StatusBadge } from '@/components/page/status-badge';
import { KpiGrid } from '@/components/page/kpi-grid';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import { Button } from '@/components/ui/button';
import type { ISaleInvoiceDetailDto } from '@zarva/shared';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly chrome?: 'full' | 'body';
}

export function SalesInvoiceDetailPage({ invoice, chrome = 'full' }: IProps) {
  const t = useTranslations('modules.sales');
  const tp = useTranslations('modules.sales.print');
  const locale = useLocale();
  const printHref = `/${locale}/sales/invoices/${invoice.id}/print`;
  const isBody = chrome === 'body';

  const body = (
    <>
      <PageHeader
        title={invoice.number}
        description={invoice.customer}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" asChild>
              <Link href={printHref}>{tp('preview')}</Link>
            </Button>
            <Button asChild>
              <Link href={`${printHref}?autoprint=1`} target="_blank" rel="noopener noreferrer">
                {tp('print')}
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/sales`}>{t('nav.invoices')}</Link>
            </Button>
          </div>
        }
      />
      <KpiGrid
        className="mb-4"
        items={[
          {
            id: 'weight',
            label: t('cols.weight'),
            value: invoice.goldWeight,
            icon: 'scale-bold',
            accent: 'bg-info/15 text-info ring-info/25',
          },
          {
            id: 'amount',
            label: t('cols.amount'),
            value: invoice.amount,
            icon: 'cart-large-2-bold',
            accent: 'bg-success/15 text-success ring-success/25',
          },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardPanel
          title={t('cols.date')}
          icon="clipboard-list-bold"
          accent="bg-primary/15 text-primary ring-primary/25"
        >
          <p className="text-sm text-foreground">{invoice.date}</p>
          <p className="mt-3 text-xs text-muted-fg">{t('cols.status')}</p>
          <div className="mt-1">
            <StatusBadge
              label={t(`status.${invoice.status}`)}
              tone={invoice.status === 'completed' ? 'gold' : 'neutral'}
              icon={invoice.status === 'completed' ? 'medal-star-bold' : 'notes-bold'}
            />
          </div>
        </DashboardPanel>
        <DashboardPanel
          title={t('cols.payment')}
          icon="card-bold"
          accent="bg-success/15 text-success ring-success/25"
        >
          <StatusBadge
            label={t(`payment.${invoice.paymentStatus}`)}
            tone={
              invoice.paymentStatus === 'paid'
                ? 'success'
                : invoice.paymentStatus === 'partial'
                  ? 'warning'
                  : 'danger'
            }
            icon={
              invoice.paymentStatus === 'paid'
                ? 'check-read-bold'
                : invoice.paymentStatus === 'partial'
                  ? 'scale-bold'
                  : 'danger-triangle-bold'
            }
          />
          <p className="mt-3 text-xs text-muted-fg">{tp('seller')}</p>
          <p className="mt-1 text-sm text-foreground">{invoice.seller}</p>
        </DashboardPanel>
      </div>
    </>
  );

  if (isBody) return body;
  return <AppShell title={invoice.number}>{body}</AppShell>;
}
