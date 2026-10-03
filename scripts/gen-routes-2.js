const fs = require('fs');
const path = require('path');
const app = 'E:/main-projects/zarva/apps/frontend/src/app/[locale]';

function write(rel, content) {
  const full = path.join(app, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

write('(app)/accounting/page.tsx', `import { AccountingHubPage } from '@/features/accounting/accounting-hub-page';

export default function Page() {
  return <AccountingHubPage />;
}
`);

const acct = [
  ['rial-ledger', 'rialLedger', 'hub.rial', 'ledger'],
  ['cash-bank', 'cashBank', 'hub.cash', 'table'],
  ['income', 'income', 'hub.income', 'table'],
  ['expenses', 'expenses', 'hub.expenses', 'table'],
  ['receivables', 'receivables', 'hub.ar', 'table'],
  ['payables', 'payables', 'hub.ap', 'table'],
  ['transactions', 'transactions', 'hub.tx', 'table'],
];

for (const [slug, navKey, desc, mode] of acct) {
  write(
    `(app)/accounting/${slug}/page.tsx`,
    `import { AccountingSectionPage } from '@/features/accounting/accounting-section-page';

export default function Page() {
  return <AccountingSectionPage navKey="${navKey}" descriptionKey="${desc}" mode="${mode}" />;
}
`,
  );
}

write('(app)/reports/page.tsx', `import { ReportsHubPage } from '@/features/reports/reports-hub-page';

export default function Page() {
  return <ReportsHubPage />;
}
`);

for (const k of ['sales', 'purchases', 'inventory', 'gold', 'profit']) {
  write(
    `(app)/reports/${k}/page.tsx`,
    `import { ReportStubPage } from '@/features/reports/report-stub-page';

export default function Page() {
  return <ReportStubPage cardKey="${k}" />;
}
`,
  );
}

write('(app)/settings/page.tsx', `import { SettingsHubPage } from '@/features/settings/settings-hub-page';

export default function Page() {
  return <SettingsHubPage />;
}
`);

const settings = [
  'general',
  'business',
  'invoices',
  'gold',
  'inventory',
  'accounting',
  'tax',
  'notifications',
  'security',
  'language',
  'backup',
];

for (const s of settings) {
  write(
    `(app)/settings/${s}/page.tsx`,
    `import { SettingsSectionPage } from '@/features/settings/settings-section-page';

export default function Page() {
  return <SettingsSectionPage section="${s}" />;
}
`,
  );
}

// appearance & billing already exist — leave them, but ensure settings/appearance still works
// Keep existing appearance page; hub links to it.

write('(app)/organization/page.tsx', `import { OrganizationHubPage } from '@/features/organization/organization-hub-page';

export default function Page() {
  return <OrganizationHubPage />;
}
`);

for (const s of ['profile', 'users', 'audit']) {
  write(
    `(app)/organization/${s}/page.tsx`,
    `import { OrganizationSectionPage } from '@/features/organization/organization-section-page';

export default function Page() {
  return <OrganizationSectionPage section="${s}" />;
}
`,
  );
}

write(
  '(app)/organization/roles/page.tsx',
  `export { default } from '../../roles/page';
`,
);

write('(app)/notifications/page.tsx', `import { NotificationsPage } from '@/features/notifications/notifications-page';

export default function Page() {
  return <NotificationsPage />;
}
`);

write('(app)/search/page.tsx', `import { SearchPage } from '@/features/search/search-page';

export default function Page() {
  return <SearchPage />;
}
`);

write('(app)/workshop/page.tsx', `import { WorkshopPage } from '@/features/workshop/workshop-page';

export default function Page() {
  return <WorkshopPage />;
}
`);

write(
  '(app)/workshop/production/page.tsx',
  `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return (
    <SimpleDomainPage
      moduleKey="workshopProduction"
      rows={[
        { id: '1', a: 'BATCH-01', b: 'دستبند', c: '65%' },
        { id: '2', a: 'BATCH-02', b: 'انگشتر', c: '40%' },
      ]}
    />
  );
}
`,
);

write(
  '(app)/workshop/artisans/page.tsx',
  `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return (
    <SimpleDomainPage
      moduleKey="workshopArtisans"
      rows={[
        { id: '1', a: 'استاد کریمی', b: 'طلاسازی', c: 'فعال' },
        { id: '2', a: 'استاد نوری', b: 'نگین', c: 'فعال' },
      ]}
    />
  );
}
`,
);

const simpleModules = [
  ['jewelry', [{ id: '1', a: 'انگشتر یاقوت', b: 'JR-01', c: 'ویترین' }, { id: '2', a: 'گوشواره', b: 'JR-02', c: 'رزرو' }]],
  ['tax', [{ id: '1', a: 'VAT-Q3', b: 'پیش‌نویس', c: '—' }, { id: '2', a: 'VAT-Q2', b: 'ارسال‌شده', c: '1403/09' }]],
  ['branches', [{ id: '1', a: 'شعبه مرکزی', b: 'تهران', c: 'فعال' }, { id: '2', a: 'شعبه اصفهان', b: 'اصفهان', c: 'فعال' }]],
  ['commerce', [{ id: '1', a: 'ویترین آنلاین', b: 'draft', c: '0 SKU' }, { id: '2', a: 'کانال واتساپ', b: 'active', c: '12' }]],
];

for (const [mod, rows] of simpleModules) {
  const lit = rows.map((r) => `{ id: '${r.id}', a: '${r.a}', b: '${r.b}', c: '${r.c}' }`).join(', ');
  write(
    `(app)/${mod}/page.tsx`,
    `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return <SimpleDomainPage moduleKey="${mod}" rows={[${lit}]} />;
}
`,
  );
}

write(
  '(app)/ai/page.tsx',
  `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return (
    <SimpleDomainPage
      moduleKey="ai"
      variant="insights"
      rows={[
        { id: '1', a: 'insightLowStock', b: 'insightLowStockBody', c: 'insightLabel' },
        { id: '2', a: 'insightMargin', b: 'insightMarginBody', c: 'insightLabel' },
      ]}
    />
  );
}
`,
);

write(
  '(app)/integrations/page.tsx',
  `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return (
    <SimpleDomainPage
      moduleKey="integrations"
      variant="hub"
      rows={[]}
      hubLinks={[
        { path: '/integrations/devices', titleKey: 'hub.devices', descKey: 'hub.devicesDesc' },
        { path: '/integrations/scale', titleKey: 'hub.scale', descKey: 'hub.scaleDesc' },
        { path: '/integrations/api', titleKey: 'hub.api', descKey: 'hub.apiDesc' },
        { path: '/integrations/webhooks', titleKey: 'hub.webhooks', descKey: 'hub.webhooksDesc' },
      ]}
    />
  );
}
`,
);

for (const s of ['devices', 'scale', 'api', 'webhooks']) {
  write(
    `(app)/integrations/${s}/page.tsx`,
    `import { SimpleDomainPage } from '@/features/domain/simple-domain-page';

export default function Page() {
  return (
    <SimpleDomainPage
      moduleKey="integrations${s[0].toUpperCase() + s.slice(1)}"
      rows={[
        { id: '1', a: 'CFG-1', b: 'idle', c: '—' },
        { id: '2', a: 'CFG-2', b: 'connected', c: 'ok' },
      ]}
    />
  );
}
`,
  );
}

// Auth extras
for (const k of ['forgot', 'reset', 'twofa', 'invite']) {
  write(
    `(auth)/${k}/page.tsx`,
    `import { AuthExtraPage } from '@/features/auth/auth-extra-pages';

export default function Page() {
  return <AuthExtraPage kind="${k}" />;
}
`,
  );
}

console.log('routes batch B ok');
