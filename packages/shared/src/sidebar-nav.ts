import type { IPlanEntitlements } from './billing.js';
import type { AppSubjects, IAbilityUser } from './authorization.js';
import { canAccessSubject, createAppAbility } from './authorization.js';

export type SidebarNavGroupId =
  | 'general'
  | 'business'
  | 'commerce'
  | 'integrations'
  | 'system';

export interface ISidebarNavGroup {
  readonly id: SidebarNavGroupId;
  readonly labelKey: string;
}

export interface ISidebarNavNode {
  readonly id: string;
  readonly href: string;
  readonly labelKey: string;
  readonly icon: string;
  readonly iconActive: string;
  readonly group: SidebarNavGroupId;
  readonly sortOrder: number;
  readonly children: ReadonlyArray<ISidebarNavNode>;
}

export interface ISidebarNavAdminNode extends ISidebarNavNode {
  readonly key: string;
  readonly parentId: string | null;
  readonly subject: AppSubjects;
  readonly roles: ReadonlyArray<string>;
  readonly moduleKey: string | null;
  readonly isActive: boolean;
  readonly children: ReadonlyArray<ISidebarNavAdminNode>;
}

export interface ISidebarNavigationResponse {
  readonly groups: ReadonlyArray<ISidebarNavGroup>;
  readonly items: ReadonlyArray<ISidebarNavNode>;
}

export interface ISidebarNavAdminResponse {
  readonly groups: ReadonlyArray<ISidebarNavGroup>;
  readonly items: ReadonlyArray<ISidebarNavAdminNode>;
}

/** Flat row used for seed / DB insert before tree build. */
export interface ISidebarNavSeedItem {
  readonly key: string;
  readonly href: string;
  readonly labelKey: string;
  readonly icon: string;
  readonly iconActive: string;
  readonly group: SidebarNavGroupId;
  readonly subject: AppSubjects;
  readonly roles?: ReadonlyArray<string>;
  readonly moduleKey?: string | null;
  readonly sortOrder: number;
}

export const SIDEBAR_NAV_GROUPS: ReadonlyArray<ISidebarNavGroup> = [
  { id: 'general', labelKey: 'groupGeneral' },
  { id: 'business', labelKey: 'groupBusiness' },
  { id: 'commerce', labelKey: 'groupCommerce' },
  { id: 'integrations', labelKey: 'groupIntegrations' },
  { id: 'system', labelKey: 'groupSystem' },
];

/** Icons currently used by sidebar (Solar CSS names). */
export const SIDEBAR_NAV_ICONS: ReadonlyArray<string> = [
  'widget-2-linear',
  'widget-2-bold',
  'bell-linear',
  'bell-bold',
  'magnifer-linear',
  'magnifer-bold',
  'cart-large-2-linear',
  'cart-large-2-bold',
  'box-linear',
  'box-bold',
  'crown-star-linear',
  'crown-star-bold',
  'users-group-rounded-linear',
  'users-group-rounded-bold',
  'delivery-linear',
  'delivery-bold',
  'calculator-linear',
  'calculator-bold',
  'settings-minimalistic-linear',
  'settings-minimalistic-bold',
  'buildings-2-linear',
  'buildings-2-bold',
  'bill-list-linear',
  'bill-list-bold',
  'chart-linear',
  'chart-bold',
  'stars-linear',
  'stars-bold',
  'shop-linear',
  'shop-bold',
  'plug-circle-linear',
  'plug-circle-bold',
  'shield-keyhole-linear',
  'shield-keyhole-bold',
  'clipboard-list-linear',
  'clipboard-list-bold',
  'settings-linear',
  'settings-bold',
];

export function isSidebarNavIcon(value: string): boolean {
  return SIDEBAR_NAV_ICONS.includes(value);
}

/**
 * Exact current sidebar catalog (1:1 with previous FE SIDEBAR_LINKS) + admin CRUD entry.
 * Seed upserts by `key`. Flat (`parentId` null); nesting added later via CRUD.
 */
export const SIDEBAR_NAV_SEED: ReadonlyArray<ISidebarNavSeedItem> = [
  { key: 'dashboard', href: '/dashboard', labelKey: 'dashboard', icon: 'widget-2-linear', iconActive: 'widget-2-bold', subject: 'Dashboard', group: 'general', sortOrder: 0 },
  { key: 'notifications', href: '/notifications', labelKey: 'notifications', icon: 'bell-linear', iconActive: 'bell-bold', subject: 'Notification', group: 'general', sortOrder: 1 },
  { key: 'search', href: '/search', labelKey: 'search', icon: 'magnifer-linear', iconActive: 'magnifer-bold', subject: 'Dashboard', group: 'general', sortOrder: 2 },
  { key: 'sales', href: '/sales', labelKey: 'sales', icon: 'cart-large-2-linear', iconActive: 'cart-large-2-bold', subject: 'Sale', group: 'business', sortOrder: 3 },
  { key: 'purchases', href: '/purchases', labelKey: 'purchases', icon: 'box-linear', iconActive: 'box-bold', subject: 'Purchase', group: 'business', sortOrder: 4 },
  { key: 'inventory', href: '/inventory', labelKey: 'inventory', icon: 'box-linear', iconActive: 'box-bold', subject: 'Inventory', group: 'business', sortOrder: 5 },
  { key: 'gold', href: '/gold', labelKey: 'gold', icon: 'crown-star-linear', iconActive: 'crown-star-bold', subject: 'GoldItem', group: 'business', sortOrder: 6 },
  { key: 'jewelry', href: '/jewelry', labelKey: 'jewelry', icon: 'crown-star-linear', iconActive: 'crown-star-bold', subject: 'Jewelry', group: 'business', moduleKey: 'jewelry', sortOrder: 7 },
  { key: 'customers', href: '/customers', labelKey: 'customers', icon: 'users-group-rounded-linear', iconActive: 'users-group-rounded-bold', subject: 'Customer', group: 'business', sortOrder: 8 },
  { key: 'suppliers', href: '/suppliers', labelKey: 'suppliers', icon: 'delivery-linear', iconActive: 'delivery-bold', subject: 'Supplier', group: 'business', sortOrder: 9 },
  { key: 'accounting', href: '/accounting', labelKey: 'accounting', icon: 'calculator-linear', iconActive: 'calculator-bold', subject: 'Journal', group: 'business', sortOrder: 10 },
  { key: 'workshop', href: '/workshop', labelKey: 'workshop', icon: 'settings-minimalistic-linear', iconActive: 'settings-minimalistic-bold', subject: 'Workshop', group: 'business', moduleKey: 'workshop', sortOrder: 11 },
  { key: 'branches', href: '/branches', labelKey: 'branches', icon: 'buildings-2-linear', iconActive: 'buildings-2-bold', subject: 'Branch', group: 'business', moduleKey: 'branches', sortOrder: 12 },
  { key: 'tax', href: '/tax', labelKey: 'tax', icon: 'bill-list-linear', iconActive: 'bill-list-bold', subject: 'Tax', group: 'business', moduleKey: 'tax', sortOrder: 13 },
  { key: 'reports', href: '/reports', labelKey: 'reports', icon: 'chart-linear', iconActive: 'chart-bold', subject: 'Report', group: 'business', sortOrder: 14 },
  { key: 'ai', href: '/ai', labelKey: 'ai', icon: 'stars-linear', iconActive: 'stars-bold', subject: 'AiInsight', group: 'business', moduleKey: 'ai', sortOrder: 15 },
  { key: 'commerce', href: '/commerce', labelKey: 'commerce', icon: 'shop-linear', iconActive: 'shop-bold', subject: 'Commerce', group: 'commerce', moduleKey: 'commerce', sortOrder: 16 },
  { key: 'integrations', href: '/integrations', labelKey: 'integrations', icon: 'plug-circle-linear', iconActive: 'plug-circle-bold', subject: 'Integration', group: 'integrations', moduleKey: 'integrations', sortOrder: 17 },
  { key: 'organization', href: '/organization', labelKey: 'organization', icon: 'buildings-2-linear', iconActive: 'buildings-2-bold', subject: 'Organization', group: 'system', sortOrder: 18 },
  { key: 'roles', href: '/organization/roles', labelKey: 'roles', icon: 'shield-keyhole-linear', iconActive: 'shield-keyhole-bold', subject: 'Role', group: 'system', sortOrder: 19 },
  { key: 'audit', href: '/organization/audit', labelKey: 'audit', icon: 'clipboard-list-linear', iconActive: 'clipboard-list-bold', subject: 'AuditLog', group: 'system', sortOrder: 20 },
  {
    key: 'platformOrgs',
    href: '/platform/organizations',
    labelKey: 'platformOrgs',
    icon: 'buildings-2-linear',
    iconActive: 'buildings-2-bold',
    subject: 'Platform',
    group: 'system',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
    sortOrder: 21,
  },
  {
    key: 'platformSessions',
    href: '/platform/sessions',
    labelKey: 'platformSessions',
    icon: 'shield-keyhole-linear',
    iconActive: 'shield-keyhole-bold',
    subject: 'Platform',
    group: 'system',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
    sortOrder: 22,
  },
  {
    key: 'platformNavigation',
    href: '/platform/navigation',
    labelKey: 'platformNavigation',
    icon: 'settings-linear',
    iconActive: 'settings-bold',
    subject: 'Platform',
    group: 'system',
    roles: ['SUPER_ADMIN'],
    sortOrder: 23,
  },
  { key: 'settings', href: '/settings', labelKey: 'settings', icon: 'settings-linear', iconActive: 'settings-bold', subject: 'Setting', group: 'system', sortOrder: 24 },
  { key: 'billing', href: '/settings/billing', labelKey: 'billing', icon: 'bill-list-linear', iconActive: 'bill-list-bold', subject: 'Billing', group: 'system', sortOrder: 25 },
];

export interface ISidebarNavFlatRow {
  readonly id: string;
  readonly parentId: string | null;
  readonly href: string;
  readonly labelKey: string;
  readonly icon: string;
  readonly iconActive: string;
  readonly group: SidebarNavGroupId;
  readonly subject: AppSubjects;
  readonly roles: ReadonlyArray<string>;
  readonly moduleKey: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly key?: string;
}

function hasModuleAccess(
  moduleKey: string | null | undefined,
  entitlements: IPlanEntitlements | null | undefined,
): boolean {
  if (!moduleKey) return true;
  if (!entitlements) return true;
  return entitlements.modules.includes('*') || entitlements.modules.includes(moduleKey);
}

export function buildSidebarNavTree(
  rows: ReadonlyArray<ISidebarNavFlatRow>,
): ReadonlyArray<ISidebarNavAdminNode> {
  const byParent = new Map<string | null, ISidebarNavFlatRow[]>();
  for (const row of rows) {
    const list = byParent.get(row.parentId) ?? [];
    list.push(row);
    byParent.set(row.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.href.localeCompare(b.href));
  }

  const walk = (parentId: string | null): ISidebarNavAdminNode[] => {
    const children = byParent.get(parentId) ?? [];
    return children.map((row) => ({
      id: row.id,
      key: row.key ?? row.id,
      parentId: row.parentId,
      href: row.href,
      labelKey: row.labelKey,
      icon: row.icon,
      iconActive: row.iconActive,
      group: row.group,
      subject: row.subject,
      roles: row.roles,
      moduleKey: row.moduleKey,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      children: walk(row.id),
    }));
  };

  return walk(null);
}

function toPublicNode(node: ISidebarNavAdminNode): ISidebarNavNode {
  return {
    id: node.id,
    href: node.href,
    labelKey: node.labelKey,
    icon: node.icon,
    iconActive: node.iconActive,
    group: node.group,
    sortOrder: node.sortOrder,
    children: node.children.map(toPublicNode),
  };
}

export function filterSidebarNavTree(
  nodes: ReadonlyArray<ISidebarNavAdminNode>,
  user: IAbilityUser,
  entitlements?: IPlanEntitlements | null,
): ReadonlyArray<ISidebarNavNode> {
  const ability = createAppAbility(user);

  const filterNode = (node: ISidebarNavAdminNode): ISidebarNavNode | null => {
    if (!node.isActive) return null;
    if (!hasModuleAccess(node.moduleKey, entitlements)) return null;
    if (node.roles.length > 0 && !node.roles.includes(user.roleName)) return null;
    if (!canAccessSubject(ability, node.subject)) return null;

    const children = node.children
      .map(filterNode)
      .filter((child): child is ISidebarNavNode => child !== null);

    return {
      id: node.id,
      href: node.href,
      labelKey: node.labelKey,
      icon: node.icon,
      iconActive: node.iconActive,
      group: node.group,
      sortOrder: node.sortOrder,
      children,
    };
  };

  return nodes.map(filterNode).filter((n): n is ISidebarNavNode => n !== null);
}

export function toPublicSidebarNavTree(
  nodes: ReadonlyArray<ISidebarNavAdminNode>,
): ReadonlyArray<ISidebarNavNode> {
  return nodes.filter((n) => n.isActive).map(toPublicNode);
}
