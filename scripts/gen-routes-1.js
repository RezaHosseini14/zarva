const fs = require('fs');
const path = require('path');
const app = 'E:/main-projects/zarva/apps/frontend/src/app/[locale]';

function write(rel, content) {
  const full = path.join(app, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

function page(imp, name) {
  return `import { ${name} } from '${imp}';

export default function Page() {
  return <${name} />;
}
`;
}

function clientIdPage(imp, name) {
  return `'use client';

import { use } from 'react';

import { ${name} } from '${imp}';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <${name} id={id} />;
}
`;
}

// Sales
write('(app)/sales/page.tsx', page('@/features/sales/sales-list-page', 'SalesListPage'));
write('(app)/sales/new/page.tsx', page('@/features/sales/sales-pos-page', 'SalesPosPage'));
write('(app)/sales/returns/page.tsx', page('@/features/sales/sales-returns-page', 'SalesReturnsPage'));
write('(app)/sales/payments/page.tsx', page('@/features/sales/sales-payments-page', 'SalesPaymentsPage'));
write('(app)/sales/invoices/[id]/page.tsx', clientIdPage('@/features/sales/sales-invoice-detail-page', 'SalesInvoiceDetailPage'));

// Purchases
write('(app)/purchases/page.tsx', page('@/features/purchases/purchases-list-page', 'PurchasesListPage'));
write('(app)/purchases/new/page.tsx', page('@/features/purchases/purchases-form-page', 'PurchasesFormPage'));
write('(app)/purchases/returns/page.tsx', page('@/features/purchases/purchases-returns-page', 'PurchasesReturnsPage'));
write('(app)/purchases/[id]/page.tsx', clientIdPage('@/features/purchases/purchases-detail-page', 'PurchasesDetailPage'));

// Inventory
write('(app)/inventory/page.tsx', page('@/features/inventory/inventory-overview-page', 'InventoryOverviewPage'));
write(
  '(app)/inventory/products/page.tsx',
  `'use client';

import { useTranslations } from 'next-intl';

import { InventorySimpleList } from '@/features/inventory/inventory-simple-list';
import { mockInventory } from '@/mocks/domain-data';

export default function Page() {
  const t = useTranslations('modules.inventory');
  return (
    <InventorySimpleList
      titleKey="nav.products"
      descriptionKey="productsDescription"
      headers={[t('cols.name'), t('cols.sku'), t('cols.qty')]}
      rows={mockInventory.map((r) => ({ id: r.id, col1: r.name, col2: r.sku, col3: String(r.qty) }))}
    />
  );
}
`,
);
write('(app)/inventory/products/[id]/page.tsx', clientIdPage('@/features/inventory/inventory-product-detail', 'InventoryProductDetailPage'));

const invSections = [
  ['movements', 'movementsDescription', [['m1', 'IN', 'RAW-995', '+100'], ['m2', 'OUT', 'CH-18-001', '-1']]],
  ['warehouses', 'warehousesDescription', [['w1', 'ویترین A', 'تهران', '14'], ['w2', 'خزانه', 'تهران', '3']]],
  ['low-stock', 'lowStockDescription', [['i3', 'سکه بهار آزادی', '2', 'low']]],
  ['valuation', 'valuationDescription', [['v1', 'طلا', '۷٫۶ م.ر', 'AVG'], ['v2', 'جواهر', '۵۴۰ م', 'FIFO']]],
  ['adjustments', 'adjustmentsDescription', [['a1', 'ADJ-01', '1403/11/01', '-0.2g']]],
  ['barcodes', 'barcodesDescription', [['b1', '8901001', 'CH-18-001', 'active']]],
];

for (const [slug, descKey, rows] of invSections) {
  const rowLit = rows.map((r, i) => `{ id: '${r[0]}', col1: '${r[1]}', col2: '${r[2]}', col3: '${r[3]}' }`).join(', ');
  write(
    `(app)/inventory/${slug}/page.tsx`,
    `'use client';

import { useTranslations } from 'next-intl';

import { InventorySimpleList } from '@/features/inventory/inventory-simple-list';

export default function Page() {
  const t = useTranslations('modules.inventory');
  return (
    <InventorySimpleList
      titleKey="nav.${slug === 'low-stock' ? 'lowStock' : slug}"
      descriptionKey="${descKey}"
      headers={[t('cols.name'), t('cols.sku'), t('cols.value')]}
      rows={[${rowLit}]}
    />
  );
}
`,
  );
}

// Gold
write('(app)/gold/page.tsx', page('@/features/gold/gold-overview-page', 'GoldOverviewPage'));
write('(app)/gold/ledger/page.tsx', page('@/features/gold/gold-ledger-page', 'GoldLedgerPage'));
write('(app)/gold/calculator/page.tsx', page('@/features/gold/gold-calculator-page', 'GoldCalculatorPage'));

const goldSections = [
  ['rates', 'ratesDescription', [['1', '18K', '۶۸٫۲', 'امروز']]],
  ['transactions', 'txDescription', [['1', 'فروش', '12.40', '18K']]],
  ['balance', 'balanceDescription', [['1', 'fine', '1240.5', 'g']]],
  ['raw', 'rawDescription', [['1', 'شمش خام', '100', '995']]],
  ['melted', 'meltedDescription', [['1', 'ذوب دسته ۱', '88', '995']]],
  ['lots', 'lotsDescription', [['1', 'LOT-09', '42', '18K']]],
  ['purities', 'puritiesDescription', [['1', '18K', '0.750', 'standard']]],
];

for (const [slug, desc, rows] of goldSections) {
  const rowLit = rows.map((r) => `{ id: '${r[0]}', a: '${r[1]}', b: '${r[2]}', c: '${r[3]}' }`).join(', ');
  write(
    `(app)/gold/${slug}/page.tsx`,
    `import { GoldSectionPage } from '@/features/gold/gold-section-page';

export default function Page() {
  return (
    <GoldSectionPage
      navKey="${slug}"
      descriptionKey="${desc}"
      rows={[${rowLit}]}
    />
  );
}
`,
  );
}

// Customers / suppliers
write(
  '(app)/customers/page.tsx',
  `import { PartiesListPage } from '@/features/parties/parties-list-page';
import { mockCustomers } from '@/mocks/domain-data';

export default function Page() {
  return <PartiesListPage kind="customers" rows={mockCustomers} />;
}
`,
);
write(
  '(app)/suppliers/page.tsx',
  `import { PartiesListPage } from '@/features/parties/parties-list-page';
import { mockSuppliers } from '@/mocks/domain-data';

export default function Page() {
  return <PartiesListPage kind="suppliers" rows={mockSuppliers} />;
}
`,
);

write(
  '(app)/customers/[id]/page.tsx',
  `'use client';

import { use } from 'react';

import { PartyDetailPage } from '@/features/parties/party-detail-page';
import { mockCustomers } from '@/mocks/domain-data';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const party = mockCustomers.find((c) => c.id === id) ?? mockCustomers[0]!;
  return <PartyDetailPage kind="customers" party={party} />;
}
`,
);
write(
  '(app)/suppliers/[id]/page.tsx',
  `'use client';

import { use } from 'react';

import { PartyDetailPage } from '@/features/parties/party-detail-page';
import { mockSuppliers } from '@/mocks/domain-data';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const party = mockSuppliers.find((c) => c.id === id) ?? mockSuppliers[0]!;
  return <PartyDetailPage kind="suppliers" party={party} />;
}
`,
);

write(
  '(app)/customers/receivables/page.tsx',
  `import { PartiesListPage } from '@/features/parties/parties-list-page';
import { mockCustomers } from '@/mocks/domain-data';

export default function Page() {
  return <PartiesListPage kind="customers" rows={mockCustomers.filter((c) => c.balance !== '۰')} />;
}
`,
);
write(
  '(app)/suppliers/receivables/page.tsx',
  `import { PartiesListPage } from '@/features/parties/parties-list-page';
import { mockSuppliers } from '@/mocks/domain-data';

export default function Page() {
  return <PartiesListPage kind="suppliers" rows={mockSuppliers.filter((c) => c.balance !== '۰')} />;
}
`,
);

console.log('routes batch A ok');
