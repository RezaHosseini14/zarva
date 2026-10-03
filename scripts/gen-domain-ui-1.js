const fs = require('fs');
const path = require('path');

const root = 'E:/main-projects/zarva/apps/frontend/src';

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

function thinPage(importPath, exportName, props = '') {
  if (props) {
    return `'use client';

import { ${exportName} } from '${importPath}';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = require('react').use(params);
  return <${exportName} id={resolved.id} />;
}
`;
  }
  return `import { ${exportName} } from '${importPath}';

export default function Page() {
  return <${exportName} />;
}
`;
}

// Sales features
write(
  'features/sales/sales-list-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { mockSalesInvoices, type ISaleInvoiceRow } from '@/mocks/domain-data';

export function SalesListPage() {
  const t = useTranslations('modules.sales');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <DomainListPage<ISaleInvoiceRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      action={
        <Link
          href={\`/\${locale}/sales/new\`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-background"
        >
          {t('newSale')}
        </Link>
      }
      kpis={[
        { id: 'today', label: t('kpi.today'), value: '۸۴۰ م.ریال' },
        { id: 'count', label: t('kpi.count'), value: '12' },
        { id: 'avg', label: t('kpi.avg'), value: '۷۰ م.ریال' },
        { id: 'unpaid', label: t('kpi.unpaid'), value: '۲٫۸ م.ر', tone: 'warning' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/sales', label: t('nav.invoices') },
            { href: '/sales/new', label: t('nav.pos') },
            { href: '/sales/returns', label: t('nav.returns') },
            { href: '/sales/payments', label: t('nav.payments') },
          ]}
        />
      }
      columns={[
        {
          id: 'number',
          header: t('cols.number'),
          cell: (r) => (
            <Link href={\`/\${locale}/sales/invoices/\${r.id}\`} className="text-primary hover:underline">
              {r.number}
            </Link>
          ),
        },
        { id: 'customer', header: t('cols.customer'), cell: (r) => r.customer },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.goldWeight} /> },
        { id: 'amount', header: t('cols.amount'), cell: (r) => <MoneyText value={r.amount} /> },
        {
          id: 'payment',
          header: t('cols.payment'),
          cell: (r) => (
            <StatusBadge
              label={t(\`payment.\${r.paymentStatus}\`)}
              tone={r.paymentStatus === 'paid' ? 'success' : r.paymentStatus === 'partial' ? 'warning' : 'danger'}
            />
          ),
        },
        { id: 'seller', header: t('cols.seller'), cell: (r) => r.seller },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge label={t(\`status.\${r.status}\`)} tone={r.status === 'completed' ? 'gold' : 'neutral'} />
          ),
        },
      ]}
      rows={mockSalesInvoices}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyActionLabel={t('newSale')}
      footer={
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-secondary">
          <span>
            {tc('total')}: {mockSalesInvoices.length}
          </span>
          <div className="flex gap-2">
            <button type="button" className="min-h-9 rounded-md border border-border px-3">
              {tc('prev')}
            </button>
            <button type="button" className="min-h-9 rounded-md border border-border px-3">
              {tc('next')}
            </button>
          </div>
        </div>
      }
    />
  );
}
`,
);

write(
  'features/sales/sales-pos-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import { MoneyText } from '@/components/business/metrics';

export function SalesPosPage() {
  const t = useTranslations('modules.sales');
  const locale = useLocale();

  return (
    <AppShell title={t('posTitle')}>
      <PageHeader
        title={t('posTitle')}
        description={t('posDescription')}
        action={
          <Link
            href={\`/\${locale}/sales\`}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm"
          >
            {t('nav.invoices')}
          </Link>
        }
      />
      <SubNav
        items={[
          { href: '/sales', label: t('nav.invoices') },
          { href: '/sales/new', label: t('nav.pos') },
          { href: '/sales/returns', label: t('nav.returns') },
          { href: '/sales/payments', label: t('nav.payments') },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="space-y-3 rounded-lg border border-border bg-card p-4 lg:col-span-7">
          <div className="flex gap-2">
            <input
              className="min-h-11 flex-1 rounded-md border border-border bg-elevated px-3"
              placeholder={t('posScan')}
            />
            <button
              type="button"
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-background"
            >
              {t('posAdd')}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-muted-fg">
              <tr className="border-b border-border">
                <th className="py-2 text-start">{t('posItem')}</th>
                <th className="py-2 text-start">{t('cols.weight')}</th>
                <th className="py-2 text-start">{t('cols.amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2">زنجیر ۱۸ عیار</td>
                <td className="py-2 tabular-nums text-primary">8.20 g</td>
                <td className="py-2">
                  <MoneyText value="۵۴۰ م.ریال" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <aside className="space-y-3 rounded-lg border border-border bg-elevated p-4 lg:col-span-5">
          <h3 className="font-medium text-primary">{t('posCheckout')}</h3>
          <label className="block space-y-1 text-sm">
            <span className="text-secondary">{t('cols.customer')}</span>
            <input
              className="min-h-11 w-full rounded-md border border-border bg-card px-3"
              placeholder={t('posCustomerPh')}
            />
          </label>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">{t('posSubtotal')}</span>
            <MoneyText value="۵۴۰ م.ریال" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">{t('posTax')}</span>
            <MoneyText value="—" />
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>{t('posTotal')}</span>
            <span className="text-primary">۵۴۰ م.ریال</span>
          </div>
          <button type="button" className="min-h-11 w-full rounded-md bg-primary font-medium text-background">
            {t('posPay')}
          </button>
        </aside>
      </div>
    </AppShell>
  );
}
`,
);

write(
  'features/sales/sales-invoice-detail-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { mockSalesInvoices } from '@/mocks/domain-data';

interface IProps {
  readonly id: string;
}

export function SalesInvoiceDetailPage({ id }: IProps) {
  const t = useTranslations('modules.sales');
  const locale = useLocale();
  const invoice = mockSalesInvoices.find((r) => r.id === id) ?? mockSalesInvoices[0]!;

  return (
    <AppShell title={invoice.number}>
      <PageHeader
        title={invoice.number}
        description={invoice.customer}
        action={
          <Link
            href={\`/\${locale}/sales\`}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm"
          >
            {t('nav.invoices')}
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.date')}</p>
          <p>{invoice.date}</p>
          <p className="text-xs text-muted-fg">{t('cols.status')}</p>
          <StatusBadge label={t(\`status.\${invoice.status}\`)} tone="gold" />
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.weight')}</p>
          <WeightText grams={invoice.goldWeight} />
          <p className="text-xs text-muted-fg">{t('cols.amount')}</p>
          <MoneyText value={invoice.amount} />
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.payment')}</p>
          <StatusBadge label={t(\`payment.\${invoice.paymentStatus}\`)} tone="success" />
          <p className="text-xs text-muted-fg">{t('cols.seller')}</p>
          <p>{invoice.seller}</p>
        </div>
      </div>
    </AppShell>
  );
}
`,
);

write(
  'features/sales/sales-returns-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';

interface IReturnRow {
  readonly id: string;
  readonly number: string;
  readonly invoice: string;
  readonly date: string;
  readonly amount: string;
}

const rows: ReadonlyArray<IReturnRow> = [
  { id: 'r1', number: 'RET-01', invoice: 'INV-1403-0990', date: '1403/11/15', amount: '۴۲ م.ریال' },
];

export function SalesReturnsPage() {
  const t = useTranslations('modules.sales');
  return (
    <DomainListPage<IReturnRow>
      shellTitle={t('returnsTitle')}
      title={t('returnsTitle')}
      description={t('returnsDescription')}
      kpis={[
        { id: 'count', label: t('kpi.returns'), value: '1' },
        { id: 'value', label: t('kpi.returnValue'), value: '۴۲ م.ریال' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/sales', label: t('nav.invoices') },
            { href: '/sales/new', label: t('nav.pos') },
            { href: '/sales/returns', label: t('nav.returns') },
            { href: '/sales/payments', label: t('nav.payments') },
          ]}
        />
      }
      columns={[
        { id: 'number', header: t('cols.number'), cell: (r) => r.number },
        { id: 'invoice', header: t('cols.invoice'), cell: (r) => r.invoice },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'amount', header: t('cols.amount'), cell: (r) => r.amount },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/sales/sales-payments-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';

interface IPayRow {
  readonly id: string;
  readonly ref: string;
  readonly customer: string;
  readonly method: string;
  readonly amount: string;
}

const rows: ReadonlyArray<IPayRow> = [
  { id: 'pay1', ref: 'PAY-901', customer: 'مریم احمدی', method: 'کارت', amount: '۸۴۰ م.ریال' },
];

export function SalesPaymentsPage() {
  const t = useTranslations('modules.sales');
  return (
    <DomainListPage<IPayRow>
      shellTitle={t('paymentsTitle')}
      title={t('paymentsTitle')}
      description={t('paymentsDescription')}
      kpis={[
        { id: 'today', label: t('kpi.paymentsToday'), value: '۸۴۰ م.ریال' },
        { id: 'pending', label: t('kpi.pending'), value: '۰' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/sales', label: t('nav.invoices') },
            { href: '/sales/new', label: t('nav.pos') },
            { href: '/sales/returns', label: t('nav.returns') },
            { href: '/sales/payments', label: t('nav.payments') },
          ]}
        />
      }
      columns={[
        { id: 'ref', header: t('cols.number'), cell: (r) => r.ref },
        { id: 'customer', header: t('cols.customer'), cell: (r) => r.customer },
        { id: 'method', header: t('cols.method'), cell: (r) => r.method },
        { id: 'amount', header: t('cols.amount'), cell: (r) => r.amount },
        {
          id: 'status',
          header: t('cols.status'),
          cell: () => <StatusBadge label={t('payment.paid')} tone="success" />,
        },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

console.log('sales ok');
