/** Path prefix → i18n namespace + tab keys for module subnav. */
export interface IModuleSubnavDef {
  readonly prefix: string;
  readonly messageNs: string;
  readonly items: ReadonlyArray<{ readonly href: string; readonly key: string }>;
}

export const MODULE_SUBNAVS: ReadonlyArray<IModuleSubnavDef> = [
  {
    prefix: '/sales',
    messageNs: 'modules.sales',
    items: [
      { href: '/sales', key: 'nav.invoices' },
      { href: '/sales/new', key: 'nav.pos' },
      { href: '/sales/returns', key: 'nav.returns' },
      { href: '/sales/payments', key: 'nav.payments' },
    ],
  },
  {
    prefix: '/purchases',
    messageNs: 'modules.purchases',
    items: [
      { href: '/purchases', key: 'nav.list' },
      { href: '/purchases/new', key: 'nav.new' },
      { href: '/purchases/returns', key: 'nav.returns' },
    ],
  },
  {
    prefix: '/accounting',
    messageNs: 'modules.accounting',
    items: [
      { href: '/accounting', key: 'nav.dashboard' },
      { href: '/accounting/rial-ledger', key: 'nav.rialLedger' },
      { href: '/accounting/cash-bank', key: 'nav.cashBank' },
      { href: '/accounting/income', key: 'nav.income' },
      { href: '/accounting/expenses', key: 'nav.expenses' },
      { href: '/accounting/receivables', key: 'nav.receivables' },
      { href: '/accounting/payables', key: 'nav.payables' },
      { href: '/accounting/transactions', key: 'nav.transactions' },
    ],
  },
  {
    prefix: '/gold',
    messageNs: 'modules.gold',
    items: [
      { href: '/gold', key: 'nav.overview' },
      { href: '/gold/rates', key: 'nav.rates' },
      { href: '/gold/transactions', key: 'nav.transactions' },
      { href: '/gold/ledger', key: 'nav.ledger' },
      { href: '/gold/balance', key: 'nav.balance' },
      { href: '/gold/raw', key: 'nav.raw' },
      { href: '/gold/melted', key: 'nav.melted' },
      { href: '/gold/lots', key: 'nav.lots' },
      { href: '/gold/purities', key: 'nav.purities' },
      { href: '/gold/calculator', key: 'nav.calculator' },
    ],
  },
  {
    prefix: '/inventory',
    messageNs: 'modules.inventory',
    items: [
      { href: '/inventory', key: 'nav.overview' },
      { href: '/inventory/products', key: 'nav.products' },
      { href: '/inventory/movements', key: 'nav.movements' },
      { href: '/inventory/warehouses', key: 'nav.warehouses' },
      { href: '/inventory/low-stock', key: 'nav.lowStock' },
      { href: '/inventory/valuation', key: 'nav.valuation' },
      { href: '/inventory/adjustments', key: 'nav.adjustments' },
      { href: '/inventory/barcodes', key: 'nav.barcodes' },
    ],
  },
  {
    prefix: '/workshop',
    messageNs: 'modules.workshop',
    items: [
      { href: '/workshop', key: 'nav.orders' },
      { href: '/workshop/production', key: 'nav.production' },
      { href: '/workshop/artisans', key: 'nav.artisans' },
    ],
  },
];

export function findModuleSubnav(appPath: string): IModuleSubnavDef | null {
  const matches = MODULE_SUBNAVS.filter(
    (m) => appPath === m.prefix || appPath.startsWith(`${m.prefix}/`),
  );
  return matches.sort((a, b) => b.prefix.length - a.prefix.length)[0] ?? null;
}
