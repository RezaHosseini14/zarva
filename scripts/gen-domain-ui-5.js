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
  'features/workshop/workshop-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { SubNav } from '@/components/page/sub-nav';
import { StatusBadge } from '@/components/page/status-badge';
import { mockWorkshopOrders, type IWorkshopOrderRow } from '@/mocks/domain-data';

export function WorkshopPage() {
  const t = useTranslations('modules.workshop');
  return (
    <DomainListPage<IWorkshopOrderRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        { id: 'open', label: t('kpi.open'), value: '2' },
        { id: 'late', label: t('kpi.late'), value: '1', tone: 'danger' },
        { id: 'done', label: t('kpi.done'), value: '18' },
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
          cell: (r) => <StatusBadge label={r.status} tone={r.progress < 50 ? 'danger' : 'warning'} />,
        },
        {
          id: 'progress',
          header: t('cols.progress'),
          cell: (r) => (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded bg-muted">
                <div className="h-full bg-primary" style={{ width: \`\${r.progress}%\` }} />
              </div>
              <span className="tabular-nums text-xs">{r.progress}%</span>
            </div>
          ),
        },
      ]}
      rows={mockWorkshopOrders}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
    />
  );
}
`,
);

write(
  'features/domain/simple-domain-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { KpiGrid } from '@/components/page/kpi-grid';
import { HubCards } from '@/components/page/hub-cards';
import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { useLocale } from 'next-intl';

interface IRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

interface IProps {
  readonly moduleKey: string;
  readonly rows: ReadonlyArray<IRow>;
  readonly variant?: 'table' | 'hub' | 'insights';
  readonly hubLinks?: ReadonlyArray<{ readonly path: string; readonly titleKey: string; readonly descKey: string }>;
}

export function SimpleDomainPage({ moduleKey, rows, variant = 'table', hubLinks }: IProps) {
  const t = useTranslations(\`modules.\${moduleKey}\`);
  const locale = useLocale();

  if (variant === 'hub' && hubLinks) {
    return (
      <AppShell title={t('title')}>
        <PageHeader title={t('title')} description={t('description')} />
        <KpiGrid
          className="mb-4"
          items={[
            { id: '1', label: t('kpi.a'), value: t('kpi.aValue') },
            { id: '2', label: t('kpi.b'), value: t('kpi.bValue') },
          ]}
        />
        <HubCards
          items={hubLinks.map((l) => ({
            href: \`/\${locale}\${l.path}\`,
            title: t(l.titleKey),
            description: t(l.descKey),
          }))}
        />
      </AppShell>
    );
  }

  if (variant === 'insights') {
    return (
      <AppShell title={t('title')}>
        <PageHeader title={t('title')} description={t('description')} />
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <article key={r.id} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-primary">{r.a}</h3>
              <p className="mt-2 text-sm text-secondary">{r.b}</p>
              <p className="mt-3 text-xs text-muted-fg">{r.c}</p>
            </article>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <DomainListPage<IRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        { id: '1', label: t('kpi.a'), value: t('kpi.aValue') },
        { id: '2', label: t('kpi.b'), value: t('kpi.bValue') },
      ]}
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

write(
  'features/notifications/notifications-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { DomainListPage } from '@/components/page/domain-list-page';
import { StatusBadge } from '@/components/page/status-badge';

interface IRow {
  readonly id: string;
  readonly title: string;
  readonly time: string;
  readonly unread: boolean;
}

const rows: ReadonlyArray<IRow> = [
  { id: '1', title: 'low-stock', time: '10:02', unread: true },
  { id: '2', title: 'payment', time: '09:40', unread: false },
];

export function NotificationsPage() {
  const t = useTranslations('modules.notifications');
  return (
    <DomainListPage<IRow>
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        { id: 'u', label: t('kpi.unread'), value: '1', tone: 'warning' },
        { id: 't', label: t('kpi.today'), value: '2' },
      ]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'title', header: t('cols.title'), cell: (r) => t(\`items.\${r.title}\`) },
        { id: 'time', header: t('cols.time'), cell: (r) => r.time },
        {
          id: 'status',
          header: t('cols.status'),
          cell: (r) => (
            <StatusBadge label={r.unread ? t('unread') : t('read')} tone={r.unread ? 'warning' : 'neutral'} />
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
  'features/search/search-page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { EmptyState } from '@/components/page/empty-state';

export function SearchPage() {
  const t = useTranslations('modules.search');
  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <input
        className="mb-4 min-h-11 w-full max-w-xl rounded-md border border-border bg-card px-3"
        placeholder={t('placeholder')}
      />
      <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
    </AppShell>
  );
}
`,
);

write(
  'features/auth/auth-extra-pages.tsx',
  `'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { StubForm } from '@/components/page/stub-form';

interface IProps {
  readonly kind: 'forgot' | 'reset' | 'twofa' | 'invite';
}

export function AuthExtraPage({ kind }: IProps) {
  const t = useTranslations(\`authExtras.\${kind}\`);
  const locale = useLocale();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">ZARVA</p>
          <h1 className="mt-2 text-xl font-semibold">{t('title')}</h1>
          <p className="mt-1 text-sm text-secondary">{t('description')}</p>
        </div>
        <StubForm
          fields={
            kind === 'twofa'
              ? [{ id: 'code', label: t('code'), placeholder: '123456' }]
              : kind === 'invite'
                ? [
                    { id: 'name', label: t('name') },
                    { id: 'password', label: t('password') },
                  ]
                : [{ id: 'email', label: t('email') }, ...(kind === 'reset' ? [{ id: 'password', label: t('password') }] : [])]
          }
          onSubmitLabel={t('submit')}
        />
        <p className="text-center text-sm text-secondary">
          <Link href={\`/\${locale}/login\`} className="text-primary hover:underline">
            {t('back')}
          </Link>
        </p>
      </div>
    </div>
  );
}
`,
);

console.log('p2/p3 helpers ok');
