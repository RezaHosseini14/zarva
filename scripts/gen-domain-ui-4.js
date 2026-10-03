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
  'features/accounting/accounting-hub-page.tsx',
  `'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { HubCards } from '@/components/page/hub-cards';
import { SubNav } from '@/components/page/sub-nav';

export function AccountingHubPage() {
  const t = useTranslations('modules.accounting');
  const locale = useLocale();
  const p = (h: string) => \`/\${locale}\${h}\`;

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <SubNav
        items={[
          { href: '/accounting', label: t('nav.dashboard') },
          { href: '/accounting/rial-ledger', label: t('nav.rialLedger') },
          { href: '/accounting/cash-bank', label: t('nav.cashBank') },
          { href: '/accounting/income', label: t('nav.income') },
          { href: '/accounting/expenses', label: t('nav.expenses') },
          { href: '/accounting/receivables', label: t('nav.receivables') },
          { href: '/accounting/payables', label: t('nav.payables') },
          { href: '/accounting/transactions', label: t('nav.transactions') },
        ]}
      />
      <KpiGrid
        className="mb-6"
        items={[
          { id: 'cash', label: t('kpi.cash'), value: '۱٫۲ م.ر' },
          { id: 'ar', label: t('kpi.ar'), value: '۱۲۰ م.ر', tone: 'warning' },
          { id: 'ap', label: t('kpi.ap'), value: '۸۰۰ م.ر', tone: 'danger' },
          { id: 'pl', label: t('kpi.pl'), value: '+۴۲۰ م.ر', tone: 'success' },
        ]}
      />
      <HubCards
        items={[
          { href: p('/accounting/rial-ledger'), title: t('nav.rialLedger'), description: t('hub.rial') },
          { href: p('/accounting/cash-bank'), title: t('nav.cashBank'), description: t('hub.cash') },
          { href: p('/accounting/income'), title: t('nav.income'), description: t('hub.income') },
          { href: p('/accounting/expenses'), title: t('nav.expenses'), description: t('hub.expenses') },
          { href: p('/accounting/receivables'), title: t('nav.receivables'), description: t('hub.ar') },
          { href: p('/accounting/payables'), title: t('nav.payables'), description: t('hub.ap') },
          { href: p('/accounting/transactions'), title: t('nav.transactions'), description: t('hub.tx') },
        ]}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/accounting/accounting-section-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { LedgerTable } from '@/components/page/ledger-table';
import { mockLedgerRows } from '@/mocks/domain-data';
import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IProps {
  readonly navKey: string;
  readonly descriptionKey: string;
  readonly mode?: 'table' | 'ledger';
  readonly rows?: ReadonlyArray<IRow>;
}

const NAV = [
  { href: '/accounting', key: 'dashboard' },
  { href: '/accounting/rial-ledger', key: 'rialLedger' },
  { href: '/accounting/cash-bank', key: 'cashBank' },
  { href: '/accounting/income', key: 'income' },
  { href: '/accounting/expenses', key: 'expenses' },
  { href: '/accounting/receivables', key: 'receivables' },
  { href: '/accounting/payables', key: 'payables' },
  { href: '/accounting/transactions', key: 'transactions' },
] as const;

export function AccountingSectionPage({ navKey, descriptionKey, mode = 'table', rows = [] }: IProps) {
  const t = useTranslations('modules.accounting');
  const nav = <SubNav items={NAV.map((n) => ({ href: n.href, label: t(\`nav.\${n.key}\`) }))} />;

  if (mode === 'ledger') {
    return (
      <AppShell title={t(\`nav.\${navKey}\`)}>
        <PageHeader title={t(\`nav.\${navKey}\`)} description={t(descriptionKey)} />
        {nav}
        <LedgerTable
          rows={[...mockLedgerRows]}
          openingLabel={t('kpi.opening')}
          openingValue="۱۲٫۴ م.ر"
          closingLabel={t('kpi.closing')}
          closingValue="۷٫۶ م.ر"
          headers={{
            date: t('cols.date'),
            description: t('cols.description'),
            debit: t('cols.debit'),
            credit: t('cols.credit'),
            balance: t('cols.balance'),
          }}
        />
      </AppShell>
    );
  }

  return (
    <DomainListPage<IRow>
      shellTitle={t(\`nav.\${navKey}\`)}
      title={t(\`nav.\${navKey}\`)}
      description={t(descriptionKey)}
      kpis={[{ id: 'n', label: t('kpi.rows'), value: String(rows.length || 2) }]}
      searchPlaceholder={t('search')}
      belowToolbar={nav}
      columns={[
        { id: 'a', header: t('cols.ref'), cell: (r) => r.a },
        { id: 'b', header: t('cols.description'), cell: (r) => r.b },
        { id: 'c', header: t('cols.amount'), cell: (r) => r.c },
      ]}
      rows={
        rows.length
          ? rows
          : [
              { id: '1', a: 'TX-101', b: t('sampleDesc'), c: '۸۴۰ م.ریال' },
              { id: '2', a: 'TX-102', b: t('sampleDesc2'), c: '۵٫۶ م.ر' },
            ]
      }
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/reports/reports-hub-page.tsx',
  `'use client';

import { useLocale, useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';

export function ReportsHubPage() {
  const t = useTranslations('modules.reports');
  const locale = useLocale();
  const p = (h: string) => \`/\${locale}\${h}\`;
  const icon = <BarChart3 className="h-4 w-4" />;

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <HubCards
        items={[
          { href: p('/reports/sales'), title: t('cards.sales'), description: t('cards.salesDesc'), icon },
          { href: p('/reports/purchases'), title: t('cards.purchases'), description: t('cards.purchasesDesc'), icon },
          { href: p('/reports/inventory'), title: t('cards.inventory'), description: t('cards.inventoryDesc'), icon },
          { href: p('/reports/gold'), title: t('cards.gold'), description: t('cards.goldDesc'), icon },
          { href: p('/reports/profit'), title: t('cards.profit'), description: t('cards.profitDesc'), icon },
        ]}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/reports/report-stub-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { ChartCard } from '@/components/page/chart-card';
import { KpiGrid } from '@/components/page/kpi-grid';
import { EmptyState } from '@/components/page/empty-state';

interface IProps {
  readonly cardKey: string;
}

export function ReportStubPage({ cardKey }: IProps) {
  const t = useTranslations('modules.reports');
  return (
    <AppShell title={t(\`cards.\${cardKey}\`)}>
      <PageHeader title={t(\`cards.\${cardKey}\`)} description={t(\`cards.\${cardKey}Desc\`)} />
      <KpiGrid
        className="mb-4"
        items={[
          { id: 'a', label: t('kpi.period'), value: t('kpi.thisMonth') },
          { id: 'b', label: t('kpi.total'), value: '—' },
        ]}
      />
      <ChartCard title={t(\`cards.\${cardKey}\`)}>
        <EmptyState title={t('chartEmpty')} description={t('chartEmptyDesc')} />
      </ChartCard>
    </AppShell>
  );
}
`,
);

write(
  'features/settings/settings-hub-page.tsx',
  `'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';

const SECTIONS = [
  'general',
  'business',
  'invoices',
  'gold',
  'inventory',
  'accounting',
  'tax',
  'notifications',
  'security',
  'appearance',
  'language',
  'backup',
  'billing',
] as const;

export function SettingsHubPage() {
  const t = useTranslations('modules.settings');
  const locale = useLocale();

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <HubCards
        items={SECTIONS.map((s) => ({
          href: \`/\${locale}/settings/\${s}\`,
          title: t(\`sections.\${s}.title\`),
          description: t(\`sections.\${s}.description\`),
        }))}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/settings/settings-section-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StubForm } from '@/components/page/stub-form';

interface IProps {
  readonly section: string;
}

export function SettingsSectionPage({ section }: IProps) {
  const t = useTranslations('modules.settings');
  return (
    <AppShell title={t(\`sections.\${section}.title\`)}>
      <PageHeader
        title={t(\`sections.\${section}.title\`)}
        description={t(\`sections.\${section}.description\`)}
      />
      <StubForm
        fields={[
          { id: 'f1', label: t('fields.value'), placeholder: t('fields.placeholder') },
          { id: 'f2', label: t('fields.note') },
        ]}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/organization/organization-hub-page.tsx',
  `'use client';

import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { HubCards } from '@/components/page/hub-cards';

export function OrganizationHubPage() {
  const t = useTranslations('modules.organization');
  const locale = useLocale();
  const p = (h: string) => \`/\${locale}\${h}\`;

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <HubCards
        items={[
          { href: p('/organization/profile'), title: t('nav.profile'), description: t('hub.profile') },
          { href: p('/organization/users'), title: t('nav.users'), description: t('hub.users') },
          { href: p('/organization/roles'), title: t('nav.roles'), description: t('hub.roles') },
          { href: p('/organization/audit'), title: t('nav.audit'), description: t('hub.audit') },
        ]}
      />
    </AppShell>
  );
}
`,
);

write(
  'features/organization/organization-section-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { StubForm } from '@/components/page/stub-form';
import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';

interface IProps {
  readonly section: 'profile' | 'users' | 'audit';
}

export function OrganizationSectionPage({ section }: IProps) {
  const t = useTranslations('modules.organization');

  if (section === 'profile') {
    return (
      <AppShell title={t('nav.profile')}>
        <PageHeader title={t('nav.profile')} description={t('hub.profile')} />
        <StubForm
          fields={[
            { id: 'name', label: t('fields.name') },
            { id: 'tax', label: t('fields.taxId') },
            { id: 'phone', label: t('fields.phone') },
          ]}
        />
      </AppShell>
    );
  }

  const rows =
    section === 'users'
      ? [
          { id: '1', a: 'admin@zarva.dev', b: 'SUPER_ADMIN', c: t('status.active') },
          { id: '2', a: 'cashier@zarva.dev', b: 'CASHIER', c: t('status.active') },
        ]
      : [
          { id: '1', a: '1403/12/01', b: 'login', c: 'admin@zarva.dev' },
          { id: '2', a: '1403/12/01', b: 'role.update', c: 'admin@zarva.dev' },
        ];

  return (
    <DomainListPage<(typeof rows)[number]>
      shellTitle={t(\`nav.\${section}\`)}
      title={t(\`nav.\${section}\`)}
      description={t(\`hub.\${section}\`)}
      kpis={[{ id: 'n', label: t('kpi.rows'), value: String(rows.length) }]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.a'), cell: (r) => r.a },
        { id: 'b', header: t('cols.b'), cell: (r) => r.b },
        { id: 'c', header: t('cols.c'), cell: (r) => r.c },
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

console.log('acct/reports/settings/org ok');
