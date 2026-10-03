const fs = require('fs');
const path = require('path');
const root = 'E:/main-projects/zarva/apps/frontend/src';
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

write(
  'features/purchases/purchases-list-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { mockPurchases, type IPurchaseRow } from '@/mocks/domain-data';

export function PurchasesListPage() {
  const t = useTranslations('modules.purchases');
  const locale = useLocale();

  return (
    <DomainListPage<IPurchaseRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      action={
        <Link
          href={\`/\${locale}/purchases/new\`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-background"
        >
          {t('newPurchase')}
        </Link>
      }
      kpis={[
        { id: 'month', label: t('kpi.month'), value: '۲۱٫۸ م.ر' },
        { id: 'weight', label: t('kpi.weight'), value: '335.5 g' },
        { id: 'open', label: t('kpi.open'), value: '1', tone: 'warning' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/purchases', label: t('nav.list') },
            { href: '/purchases/new', label: t('nav.new') },
            { href: '/purchases/returns', label: t('nav.returns') },
          ]}
        />
      }
      columns={[
        {
          id: 'number',
          header: t('cols.number'),
          cell: (r) => (
            <Link href={\`/\${locale}/purchases/\${r.id}\`} className="text-primary hover:underline">
              {r.number}
            </Link>
          ),
        },
        { id: 'supplier', header: t('cols.supplier'), cell: (r) => r.supplier },
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.goldWeight} /> },
        { id: 'amount', header: t('cols.amount'), cell: (r) => <MoneyText value={r.amount} /> },
        {
          id: 'payment',
          header: t('cols.payment'),
          cell: (r) => (
            <StatusBadge
              label={t(\`payment.\${r.paymentStatus}\`)}
              tone={r.paymentStatus === 'paid' ? 'success' : 'warning'}
            />
          ),
        },
      ]}
      rows={mockPurchases}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/purchases/purchases-form-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import { StubForm } from '@/components/page/stub-form';

export function PurchasesFormPage() {
  const t = useTranslations('modules.purchases');
  return (
    <AppShell title={t('newPurchase')}>
      <PageHeader title={t('newPurchase')} description={t('formDescription')} />
      <SubNav
        items={[
          { href: '/purchases', label: t('nav.list') },
          { href: '/purchases/new', label: t('nav.new') },
          { href: '/purchases/returns', label: t('nav.returns') },
        ]}
      />
      <StubForm
        fields={[
          { id: 'supplier', label: t('cols.supplier'), placeholder: t('supplierPh') },
          { id: 'weight', label: t('cols.weight'), placeholder: '0.00' },
          { id: 'purity', label: t('cols.purity'), placeholder: '995' },
          { id: 'amount', label: t('cols.amount') },
        ]}
        onSubmitLabel={t('newPurchase')}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/purchases/purchases-detail-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { mockPurchases } from '@/mocks/domain-data';

interface IProps {
  readonly id: string;
}

export function PurchasesDetailPage({ id }: IProps) {
  const t = useTranslations('modules.purchases');
  const locale = useLocale();
  const row = mockPurchases.find((r) => r.id === id) ?? mockPurchases[0]!;

  return (
    <AppShell title={row.number}>
      <PageHeader
        title={row.number}
        description={row.supplier}
        action={
          <Link
            href={\`/\${locale}/purchases\`}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm"
          >
            {t('nav.list')}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.date')}</p>
          <p className="mt-1">{row.date}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.weight')}</p>
          <div className="mt-1">
            <WeightText grams={row.goldWeight} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.amount')}</p>
          <div className="mt-1">
            <MoneyText value={row.amount} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
`,
);

write(
  'features/purchases/purchases-returns-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';

interface IRow {
  readonly id: string;
  readonly number: string;
  readonly purchase: string;
  readonly date: string;
  readonly amount: string;
}

const rows: ReadonlyArray<IRow> = [
  { id: 'pr1', number: 'PRET-1', purchase: 'PUR-880', date: '1403/10/12', amount: '۹۰ م.ریال' },
];

export function PurchasesReturnsPage() {
  const t = useTranslations('modules.purchases');
  return (
    <DomainListPage<IRow>
      shellTitle={t('returnsTitle')}
      title={t('returnsTitle')}
      description={t('returnsDescription')}
      kpis={[{ id: 'n', label: t('kpi.returns'), value: String(rows.length) }]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/purchases', label: t('nav.list') },
            { href: '/purchases/new', label: t('nav.new') },
            { href: '/purchases/returns', label: t('nav.returns') },
          ]}
        />
      }
      columns={[
        { id: 'number', header: t('cols.number'), cell: (r) => r.number },
        { id: 'purchase', header: t('cols.purchase'), cell: (r) => r.purchase },
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

// Inventory
write(
  'features/inventory/inventory-overview-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { mockInventory, type IInventoryRow } from '@/mocks/domain-data';

export function InventoryOverviewPage() {
  const t = useTranslations('modules.inventory');
  const locale = useLocale();

  return (
    <DomainListPage<IInventoryRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      action={
        <Link
          href={\`/\${locale}/inventory/products\`}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-background"
        >
          {t('nav.products')}
        </Link>
      }
      kpis={[
        { id: 'skus', label: t('kpi.skus'), value: String(mockInventory.length) },
        { id: 'value', label: t('kpi.value'), value: '۷٫۶ م.ر' },
        { id: 'low', label: t('kpi.low'), value: '1', tone: 'danger' },
        { id: 'weight', label: t('kpi.weight'), value: '116.33 g' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: '/inventory', label: t('nav.overview') },
            { href: '/inventory/products', label: t('nav.products') },
            { href: '/inventory/movements', label: t('nav.movements') },
            { href: '/inventory/warehouses', label: t('nav.warehouses') },
            { href: '/inventory/low-stock', label: t('nav.lowStock') },
            { href: '/inventory/valuation', label: t('nav.valuation') },
            { href: '/inventory/adjustments', label: t('nav.adjustments') },
            { href: '/inventory/barcodes', label: t('nav.barcodes') },
          ]}
        />
      }
      columns={[
        {
          id: 'name',
          header: t('cols.name'),
          cell: (r) => (
            <Link href={\`/\${locale}/inventory/products/\${r.id}\`} className="text-primary hover:underline">
              {r.name}
            </Link>
          ),
        },
        { id: 'sku', header: t('cols.sku'), cell: (r) => r.sku },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.weight} /> },
        { id: 'purity', header: t('cols.purity'), cell: (r) => r.purity },
        { id: 'qty', header: t('cols.qty'), cell: (r) => r.qty },
        { id: 'location', header: t('cols.location'), cell: (r) => r.location },
        { id: 'value', header: t('cols.value'), cell: (r) => <MoneyText value={r.value} /> },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge
              label={t(\`status.\${r.status}\`)}
              tone={r.status === 'low' ? 'danger' : r.status === 'available' ? 'success' : 'warning'}
            />
          ),
        },
      ]}
      rows={mockInventory}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/inventory/inventory-simple-list.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';

interface ISimpleRow {
  readonly id: string;
  readonly col1: string;
  readonly col2: string;
  readonly col3: string;
}

interface IProps {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly rows: ReadonlyArray<ISimpleRow>;
  readonly headers: readonly [string, string, string];
}

const NAV = [
  { href: '/inventory', key: 'overview' },
  { href: '/inventory/products', key: 'products' },
  { href: '/inventory/movements', key: 'movements' },
  { href: '/inventory/warehouses', key: 'warehouses' },
  { href: '/inventory/low-stock', key: 'lowStock' },
  { href: '/inventory/valuation', key: 'valuation' },
  { href: '/inventory/adjustments', key: 'adjustments' },
  { href: '/inventory/barcodes', key: 'barcodes' },
] as const;

export function InventorySimpleList({ titleKey, descriptionKey, rows, headers }: IProps) {
  const t = useTranslations('modules.inventory');
  return (
    <DomainListPage<ISimpleRow>
      shellTitle={t(titleKey)}
      title={t(titleKey)}
      description={t(descriptionKey)}
      kpis={[{ id: 'n', label: t('kpi.rows'), value: String(rows.length) }]}
      searchPlaceholder={t('search')}
      belowToolbar={<SubNav items={NAV.map((n) => ({ href: n.href, label: t(\`nav.\${n.key}\`) }))} />}
      columns={[
        { id: 'c1', header: headers[0], cell: (r) => r.col1 },
        { id: 'c2', header: headers[1], cell: (r) => r.col2 },
        { id: 'c3', header: headers[2], cell: (r) => r.col3 },
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
  'features/inventory/inventory-product-detail.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { MoneyText, WeightText } from '@/components/business/metrics';
import { StatusBadge } from '@/components/page/status-badge';
import { mockInventory } from '@/mocks/domain-data';

interface IProps {
  readonly id: string;
}

export function InventoryProductDetailPage({ id }: IProps) {
  const t = useTranslations('modules.inventory');
  const locale = useLocale();
  const row = mockInventory.find((r) => r.id === id) ?? mockInventory[0]!;

  return (
    <AppShell title={row.name}>
      <PageHeader
        title={row.name}
        description={row.sku}
        action={
          <Link
            href={\`/\${locale}/inventory\`}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm"
          >
            {t('nav.overview')}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.weight')}</p>
          <WeightText grams={row.weight} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.purity')}</p>
          <p className="mt-1">{row.purity}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.value')}</p>
          <MoneyText value={row.value} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.status')}</p>
          <StatusBadge label={t(\`status.\${row.status}\`)} tone="gold" />
        </div>
      </div>
    </AppShell>
  );
}
`,
);

console.log('purchases+inventory ok');
