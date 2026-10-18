import { SIDEBAR_NAV_GROUPS, SIDEBAR_NAV_SEED } from '@zarva/shared';

/** Nested paths → full next-intl message keys (beyond sidebar `nav.*`). */
export const NESTED_ROUTE_MESSAGES: ReadonlyArray<{
  readonly href: string;
  readonly messageKey: string;
}> = [
  { href: '/sales/new', messageKey: 'modules.sales.newSale' },
  { href: '/sales/returns', messageKey: 'modules.sales.returnsTitle' },
  { href: '/sales/payments', messageKey: 'modules.sales.paymentsTitle' },
  { href: '/purchases/new', messageKey: 'modules.purchases.newPurchase' },
  { href: '/purchases/returns', messageKey: 'modules.purchases.returnsTitle' },
  { href: '/gold/rates', messageKey: 'modules.gold.nav.rates' },
  { href: '/gold/transactions', messageKey: 'modules.gold.nav.transactions' },
  { href: '/gold/ledger', messageKey: 'modules.gold.nav.ledger' },
  { href: '/gold/balance', messageKey: 'modules.gold.nav.balance' },
  { href: '/inventory/products', messageKey: 'modules.inventory.nav.products' },
  { href: '/inventory/movements', messageKey: 'modules.inventory.nav.movements' },
  { href: '/inventory/warehouses', messageKey: 'modules.inventory.nav.warehouses' },
  { href: '/accounting/transactions', messageKey: 'modules.accounting.nav.transactions' },
  { href: '/workshop/production', messageKey: 'modules.workshop.nav.production' },
  { href: '/workshop/artisans', messageKey: 'modules.workshop.nav.artisans' },
];

/** Href → nav labelKey for crumbs / titles (seed catalog; live menu is API). */
export const SIDEBAR_HREF_LABEL_KEYS: ReadonlyArray<{
  readonly href: string;
  readonly labelKey: string;
}> = SIDEBAR_NAV_SEED.map((item) => ({
  href: item.href,
  labelKey: item.labelKey,
}));

export const SIDEBAR_GROUPS = SIDEBAR_NAV_GROUPS;

/** @deprecated Prefer SIDEBAR_HREF_LABEL_KEYS — kept for crumb/title helpers. */
export const SIDEBAR_LINKS = SIDEBAR_HREF_LABEL_KEYS;
