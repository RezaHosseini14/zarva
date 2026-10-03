import type { AppSubjects } from '@zarva/shared';

import type { IconName } from '@/components/ui/icon';

export interface ISidebarLink {
  readonly href: string;
  readonly labelKey: string;
  readonly icon: IconName;
  readonly iconActive: IconName;
  readonly subject: AppSubjects;
  readonly group: 'general' | 'business' | 'commerce' | 'integrations' | 'system';
  /** When set, only these role names see the link (in addition to CASL). */
  readonly roles?: ReadonlyArray<string>;
}

/** Exact app paths (no locale) → `nav.*` label key. */
export const SIDEBAR_LINKS: ReadonlyArray<ISidebarLink> = [
  { href: '/dashboard', labelKey: 'dashboard', icon: 'widget-2-linear', iconActive: 'widget-2-bold', subject: 'Dashboard', group: 'general' },
  { href: '/notifications', labelKey: 'notifications', icon: 'bell-linear', iconActive: 'bell-bold', subject: 'Notification', group: 'general' },
  { href: '/search', labelKey: 'search', icon: 'magnifer-linear', iconActive: 'magnifer-bold', subject: 'Dashboard', group: 'general' },
  { href: '/sales', labelKey: 'sales', icon: 'cart-large-2-linear', iconActive: 'cart-large-2-bold', subject: 'Sale', group: 'business' },
  { href: '/purchases', labelKey: 'purchases', icon: 'box-linear', iconActive: 'box-bold', subject: 'Purchase', group: 'business' },
  { href: '/inventory', labelKey: 'inventory', icon: 'box-linear', iconActive: 'box-bold', subject: 'Inventory', group: 'business' },
  { href: '/gold', labelKey: 'gold', icon: 'crown-star-linear', iconActive: 'crown-star-bold', subject: 'GoldItem', group: 'business' },
  { href: '/jewelry', labelKey: 'jewelry', icon: 'crown-star-linear', iconActive: 'crown-star-bold', subject: 'Jewelry', group: 'business' },
  { href: '/customers', labelKey: 'customers', icon: 'users-group-rounded-linear', iconActive: 'users-group-rounded-bold', subject: 'Customer', group: 'business' },
  { href: '/suppliers', labelKey: 'suppliers', icon: 'delivery-linear', iconActive: 'delivery-bold', subject: 'Supplier', group: 'business' },
  { href: '/accounting', labelKey: 'accounting', icon: 'calculator-linear', iconActive: 'calculator-bold', subject: 'Journal', group: 'business' },
  { href: '/workshop', labelKey: 'workshop', icon: 'settings-minimalistic-linear', iconActive: 'settings-minimalistic-bold', subject: 'Workshop', group: 'business' },
  { href: '/branches', labelKey: 'branches', icon: 'buildings-2-linear', iconActive: 'buildings-2-bold', subject: 'Branch', group: 'business' },
  { href: '/tax', labelKey: 'tax', icon: 'bill-list-linear', iconActive: 'bill-list-bold', subject: 'Tax', group: 'business' },
  { href: '/reports', labelKey: 'reports', icon: 'chart-linear', iconActive: 'chart-bold', subject: 'Report', group: 'business' },
  { href: '/ai', labelKey: 'ai', icon: 'stars-linear', iconActive: 'stars-bold', subject: 'AiInsight', group: 'business' },
  { href: '/commerce', labelKey: 'commerce', icon: 'shop-linear', iconActive: 'shop-bold', subject: 'Commerce', group: 'commerce' },
  { href: '/integrations', labelKey: 'integrations', icon: 'plug-circle-linear', iconActive: 'plug-circle-bold', subject: 'Integration', group: 'integrations' },
  { href: '/organization', labelKey: 'organization', icon: 'buildings-2-linear', iconActive: 'buildings-2-bold', subject: 'Organization', group: 'system' },
  { href: '/organization/roles', labelKey: 'roles', icon: 'shield-keyhole-linear', iconActive: 'shield-keyhole-bold', subject: 'Role', group: 'system' },
  { href: '/organization/audit', labelKey: 'audit', icon: 'clipboard-list-linear', iconActive: 'clipboard-list-bold', subject: 'AuditLog', group: 'system' },
  {
    href: '/platform/organizations',
    labelKey: 'platformOrgs',
    icon: 'buildings-2-linear',
    iconActive: 'buildings-2-bold',
    subject: 'Platform',
    group: 'system',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
  },
  {
    href: '/platform/sessions',
    labelKey: 'platformSessions',
    icon: 'shield-keyhole-linear',
    iconActive: 'shield-keyhole-bold',
    subject: 'Platform',
    group: 'system',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
  },
  { href: '/settings', labelKey: 'settings', icon: 'settings-linear', iconActive: 'settings-bold', subject: 'Setting', group: 'system' },
  { href: '/settings/billing', labelKey: 'billing', icon: 'bill-list-linear', iconActive: 'bill-list-bold', subject: 'Billing', group: 'system' },
];

/** Nested paths → full next-intl message keys (beyond sidebar `nav.*`). */
export const NESTED_ROUTE_MESSAGES: ReadonlyArray<{ readonly href: string; readonly messageKey: string }> = [
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

export const SIDEBAR_GROUPS: ReadonlyArray<{ readonly id: ISidebarLink['group']; readonly labelKey: string }> = [
  { id: 'general', labelKey: 'groupGeneral' },
  { id: 'business', labelKey: 'groupBusiness' },
  { id: 'commerce', labelKey: 'groupCommerce' },
  { id: 'integrations', labelKey: 'groupIntegrations' },
  { id: 'system', labelKey: 'groupSystem' },
];
