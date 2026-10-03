const fs = require('fs');
const path = require('path');
const root = 'E:/main-projects/zarva/apps/frontend/src';
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

const GOLD_NAV = [
  { href: '/gold', key: 'overview' },
  { href: '/gold/rates', key: 'rates' },
  { href: '/gold/transactions', key: 'transactions' },
  { href: '/gold/ledger', key: 'ledger' },
  { href: '/gold/balance', key: 'balance' },
  { href: '/gold/raw', key: 'raw' },
  { href: '/gold/melted', key: 'melted' },
  { href: '/gold/lots', key: 'lots' },
  { href: '/gold/purities', key: 'purities' },
  { href: '/gold/calculator', key: 'calculator' },
];

write(
  'features/gold/gold-nav.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { SubNav } from '@/components/page/sub-nav';

const ITEMS = ${JSON.stringify(GOLD_NAV)};

export function GoldNav() {
  const t = useTranslations('modules.gold');
  return <SubNav items={ITEMS.map((n) => ({ href: n.href, label: t(\`nav.\${n.key}\`) }))} />;
}
`,
);

write(
  'features/gold/gold-overview-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { WeightText } from '@/components/business/metrics';
import { mockGoldTxns, type IGoldTxnRow } from '@/mocks/domain-data';
import { GoldNav } from './gold-nav';

export function GoldOverviewPage() {
  const t = useTranslations('modules.gold');
  return (
    <DomainListPage<IGoldTxnRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        { id: 'fine', label: t('kpi.fine'), value: '1,240.5 g', tone: 'gold' },
        { id: 'raw', label: t('kpi.raw'), value: '320 g' },
        { id: 'melted', label: t('kpi.melted'), value: '88 g' },
        { id: 'rate', label: t('kpi.rate'), value: '۶۸٫۲ م/گرم' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={<GoldNav />}
      columns={[
        { id: 'date', header: t('cols.date'), cell: (r) => r.date },
        { id: 'type', header: t('cols.type'), cell: (r) => r.type },
        { id: 'weight', header: t('cols.weight'), cell: (r) => <WeightText grams={r.weight} /> },
        { id: 'purity', header: t('cols.purity'), cell: (r) => r.purity },
        { id: 'fine', header: t('cols.fine'), cell: (r) => <WeightText grams={r.fineGold} /> },
        { id: 'party', header: t('cols.counterparty'), cell: (r) => r.counterparty },
        { id: 'ref', header: t('cols.reference'), cell: (r) => r.reference },
      ]}
      rows={mockGoldTxns}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/gold/gold-ledger-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { KpiGrid } from '@/components/page/kpi-grid';
import { LedgerTable } from '@/components/page/ledger-table';
import { mockLedgerRows } from '@/mocks/domain-data';
import { GoldNav } from './gold-nav';

export function GoldLedgerPage() {
  const t = useTranslations('modules.gold');
  return (
    <AppShell title={t('nav.ledger')}>
      <PageHeader title={t('nav.ledger')} description={t('ledgerDescription')} />
      <GoldNav />
      <KpiGrid
        className="mb-4"
        items={[
          { id: 'open', label: t('kpi.opening'), value: '۱۲٫۴ م.ر' },
          { id: 'close', label: t('kpi.closing'), value: '۷٫۶ م.ر', tone: 'gold' },
        ]}
      />
      <LedgerTable
        rows={[...mockLedgerRows]}
        openingLabel={t('kpi.opening')}
        openingValue="۱۲٫۴ میلیارد ریال"
        closingLabel={t('kpi.closing')}
        closingValue="۷٫۶ میلیارد ریال"
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
`,
);

write(
  'features/gold/gold-calculator-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StubForm } from '@/components/page/stub-form';
import { GoldNav } from './gold-nav';

export function GoldCalculatorPage() {
  const t = useTranslations('modules.gold');
  return (
    <AppShell title={t('nav.calculator')}>
      <PageHeader title={t('nav.calculator')} description={t('calculatorDescription')} />
      <GoldNav />
      <div className="mb-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
        {t('calculatorDisclaimer')}
      </div>
      <StubForm
        fields={[
          { id: 'weight', label: t('cols.weight'), placeholder: '10.00' },
          { id: 'purity', label: t('cols.purity'), placeholder: '18' },
          { id: 'rate', label: t('kpi.rate'), placeholder: '68200000' },
          { id: 'fee', label: t('cols.fee'), placeholder: '0' },
        ]}
        onSubmitLabel={t('calculate')}
      >
        <div className="rounded-md border border-border bg-elevated p-3 text-sm text-secondary">
          {t('calculatorResult')}: <span className="font-medium text-primary">—</span>
        </div>
      </StubForm>
    </AppShell>
  );
}
`,
);

write(
  'features/gold/gold-section-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { GoldNav } from './gold-nav';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IProps {
  readonly navKey: string;
  readonly descriptionKey: string;
  readonly rows: ReadonlyArray<IRow>;
}

export function GoldSectionPage({ navKey, descriptionKey, rows }: IProps) {
  const t = useTranslations('modules.gold');
  return (
    <DomainListPage<IRow>
      shellTitle={t(\`nav.\${navKey}\`)}
      title={t(\`nav.\${navKey}\`)}
      description={t(descriptionKey)}
      kpis={[{ id: 'n', label: t('kpi.rows'), value: String(rows.length) }]}
      searchPlaceholder={t('search')}
      belowToolbar={<GoldNav />}
      columns={[
        { id: 'a', header: t('cols.name'), cell: (r) => r.a },
        { id: 'b', header: t('cols.weight'), cell: (r) => r.b },
        { id: 'c', header: t('cols.purity'), cell: (r) => r.c },
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

// Parties
write(
  'features/parties/parties-list-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { MoneyText } from '@/components/business/metrics';
import type { IPartyRow } from '@/mocks/domain-data';

interface IProps {
  readonly kind: 'customers' | 'suppliers';
  readonly rows: ReadonlyArray<IPartyRow>;
}

export function PartiesListPage({ kind, rows }: IProps) {
  const t = useTranslations(\`modules.\${kind}\`);
  const locale = useLocale();
  const base = kind === 'customers' ? '/customers' : '/suppliers';

  return (
    <DomainListPage<IPartyRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        { id: 'count', label: t('kpi.count'), value: String(rows.length) },
        { id: 'balance', label: t('kpi.balance'), value: rows[0]?.balance ?? '۰', tone: 'warning' },
        { id: 'total', label: t('kpi.total'), value: '—' },
      ]}
      searchPlaceholder={t('search')}
      belowToolbar={
        <SubNav
          items={[
            { href: base, label: t('nav.list') },
            { href: \`\${base}/receivables\`, label: t('nav.balances') },
          ]}
        />
      }
      columns={[
        {
          id: 'name',
          header: t('cols.name'),
          cell: (r) => (
            <Link href={\`/\${locale}\${base}/\${r.id}\`} className="text-primary hover:underline">
              {r.name}
            </Link>
          ),
        },
        { id: 'contact', header: t('cols.contact'), cell: (r) => r.contact },
        { id: 'balance', header: t('cols.balance'), cell: (r) => <MoneyText value={r.balance} /> },
        { id: 'last', header: t('cols.lastTxn'), cell: (r) => r.lastTxn },
        { id: 'total', header: t('cols.total'), cell: (r) => <MoneyText value={r.total} /> },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge label={t(\`status.\${r.status}\`)} tone={r.status === 'active' ? 'success' : 'neutral'} />
          ),
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

write(
  'features/parties/party-detail-page.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import { MoneyText } from '@/components/business/metrics';
import type { IPartyRow } from '@/mocks/domain-data';

interface IProps {
  readonly kind: 'customers' | 'suppliers';
  readonly party: IPartyRow;
}

export function PartyDetailPage({ kind, party }: IProps) {
  const t = useTranslations(\`modules.\${kind}\`);
  const locale = useLocale();
  const base = kind === 'customers' ? '/customers' : '/suppliers';

  return (
    <AppShell title={party.name}>
      <PageHeader
        title={party.name}
        description={party.contact}
        action={
          <Link
            href={\`/\${locale}\${base}\`}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm"
          >
            {t('nav.list')}
          </Link>
        }
      />
      <SubNav
        items={[
          { href: \`\${base}/\${party.id}\`, label: t('nav.profile') },
          { href: \`\${base}/receivables\`, label: t('nav.balances') },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.balance')}</p>
          <MoneyText value={party.balance} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.total')}</p>
          <MoneyText value={party.total} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-fg">{t('cols.lastTxn')}</p>
          <p className="mt-1">{party.lastTxn}</p>
        </div>
      </div>
    </AppShell>
  );
}
`,
);

console.log('gold+parties ok');
