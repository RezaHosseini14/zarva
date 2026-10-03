import type { ForcedSubject, MongoAbility, RawRuleOf } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export type AppActions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'approve'
  | 'adjust'
  | 'void'
  | 'print'
  | 'assign';

export type AppSubjects =
  | 'Dashboard'
  | 'Sale'
  | 'Purchase'
  | 'Inventory'
  | 'GoldItem'
  | 'Customer'
  | 'Supplier'
  | 'Invoice'
  | 'Journal'
  | 'Payment'
  | 'Report'
  | 'Branch'
  | 'User'
  | 'Role'
  | 'Setting'
  | 'Theme'
  | 'Notification'
  | 'Media'
  | 'AuditLog'
  | 'Billing'
  | 'Plan'
  | 'Subscription'
  | 'Platform'
  | 'Organization'
  | 'Jewelry'
  | 'Tax'
  | 'Workshop'
  | 'AiInsight'
  | 'Commerce'
  | 'Integration'
  | 'all';

export type UserSubject = ForcedSubject<'User'> & { id: string };

export type AppAbility = MongoAbility<[AppActions, AppSubjects | UserSubject]>;

export interface IAbilityUser {
  readonly id: string;
  readonly roleName: string;
  readonly permissions: ReadonlyArray<string>;
  readonly branchId?: string | null;
}

export interface IAbilityRequirement {
  readonly action: AppActions;
  readonly subject: AppSubjects;
}

/** Maps `resource.action` permission strings to CASL rules. */
const PERMISSION_MAP: Readonly<Record<string, IAbilityRequirement>> = {
  'dashboard.read': { action: 'read', subject: 'Dashboard' },
  'sales.read': { action: 'read', subject: 'Sale' },
  'sales.create': { action: 'create', subject: 'Sale' },
  'sales.update': { action: 'update', subject: 'Sale' },
  'sales.delete': { action: 'delete', subject: 'Sale' },
  'sales.void': { action: 'void', subject: 'Sale' },
  'purchases.read': { action: 'read', subject: 'Purchase' },
  'purchases.create': { action: 'create', subject: 'Purchase' },
  'purchases.update': { action: 'update', subject: 'Purchase' },
  'purchases.delete': { action: 'delete', subject: 'Purchase' },
  'inventory.read': { action: 'read', subject: 'Inventory' },
  'inventory.create': { action: 'create', subject: 'Inventory' },
  'inventory.update': { action: 'update', subject: 'Inventory' },
  'inventory.adjust': { action: 'adjust', subject: 'Inventory' },
  'inventory.cost.read': { action: 'read', subject: 'Inventory' },
  'gold.read': { action: 'read', subject: 'GoldItem' },
  'gold.create': { action: 'create', subject: 'GoldItem' },
  'gold.update': { action: 'update', subject: 'GoldItem' },
  'gold.delete': { action: 'delete', subject: 'GoldItem' },
  'customers.read': { action: 'read', subject: 'Customer' },
  'customers.create': { action: 'create', subject: 'Customer' },
  'customers.update': { action: 'update', subject: 'Customer' },
  'customers.delete': { action: 'delete', subject: 'Customer' },
  'suppliers.read': { action: 'read', subject: 'Supplier' },
  'suppliers.create': { action: 'create', subject: 'Supplier' },
  'suppliers.update': { action: 'update', subject: 'Supplier' },
  'suppliers.delete': { action: 'delete', subject: 'Supplier' },
  'accounting.read': { action: 'read', subject: 'Journal' },
  'accounting.create': { action: 'create', subject: 'Journal' },
  'accounting.update': { action: 'update', subject: 'Journal' },
  'reports.read': { action: 'read', subject: 'Report' },
  'reports.export': { action: 'export', subject: 'Report' },
  'users.read': { action: 'read', subject: 'User' },
  'users.create': { action: 'create', subject: 'User' },
  'users.update': { action: 'update', subject: 'User' },
  'users.delete': { action: 'delete', subject: 'User' },
  'roles.read': { action: 'read', subject: 'Role' },
  'roles.manage': { action: 'manage', subject: 'Role' },
  'settings.read': { action: 'read', subject: 'Setting' },
  'settings.update': { action: 'update', subject: 'Setting' },
  'theme.read': { action: 'read', subject: 'Theme' },
  'theme.update': { action: 'update', subject: 'Theme' },
  'billing.read': { action: 'read', subject: 'Billing' },
  'billing.manage': { action: 'manage', subject: 'Billing' },
  'audit.read': { action: 'read', subject: 'AuditLog' },
  'media.upload': { action: 'create', subject: 'Media' },
  'media.read': { action: 'read', subject: 'Media' },
  'notifications.read': { action: 'read', subject: 'Notification' },
  'notifications.send': { action: 'create', subject: 'Notification' },
  'notifications.send.low': { action: 'create', subject: 'Notification' },
  'notifications.send.normal': { action: 'create', subject: 'Notification' },
  'notifications.send.high': { action: 'create', subject: 'Notification' },
  'notifications.send.critical': { action: 'create', subject: 'Notification' },
  'notifications.broadcast_platform': { action: 'assign', subject: 'Notification' },
  'organization.read': { action: 'read', subject: 'Organization' },
  'organization.update': { action: 'update', subject: 'Organization' },
  'jewelry.read': { action: 'read', subject: 'Jewelry' },
  'jewelry.manage': { action: 'manage', subject: 'Jewelry' },
  'tax.read': { action: 'read', subject: 'Tax' },
  'tax.manage': { action: 'manage', subject: 'Tax' },
  'workshop.read': { action: 'read', subject: 'Workshop' },
  'workshop.manage': { action: 'manage', subject: 'Workshop' },
  'branches.read': { action: 'read', subject: 'Branch' },
  'branches.manage': { action: 'manage', subject: 'Branch' },
  'ai.read': { action: 'read', subject: 'AiInsight' },
  'ai.manage': { action: 'manage', subject: 'AiInsight' },
  'commerce.read': { action: 'read', subject: 'Commerce' },
  'commerce.manage': { action: 'manage', subject: 'Commerce' },
  'integrations.read': { action: 'read', subject: 'Integration' },
  'integrations.manage': { action: 'manage', subject: 'Integration' },
  'platform.organizations.read': { action: 'read', subject: 'Platform' },
  'platform.organizations.manage': { action: 'manage', subject: 'Platform' },
};

export function isPlatformAdminRole(roleName: string): boolean {
  return roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN';
}

export function createAppAbility(user: IAbilityUser): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (
    user.roleName === 'SUPER_ADMIN' ||
    user.roleName === 'PLATFORM_ADMIN' ||
    user.roleName === 'ORG_ADMIN'
  ) {
    can('manage', 'all');
    return build();
  }

  for (const permission of user.permissions) {
    const rule = PERMISSION_MAP[permission];
    if (!rule) {
      continue;
    }
    can(rule.action, rule.subject);
  }

  return build();
}

/** Nav / route gate: manage-all or read/manage on subject. */
export function canAccessSubject(ability: AppAbility, subject: AppSubjects): boolean {
  return (
    ability.can('manage', 'all') ||
    ability.can('read', subject) ||
    ability.can('manage', subject)
  );
}

export function permissionToRule(permission: string): IAbilityRequirement | undefined {
  return PERMISSION_MAP[permission];
}

export type AppRawRule = RawRuleOf<AppAbility>;

export const ALL_PERMISSION_KEYS: ReadonlyArray<string> = Object.freeze(
  Object.keys(PERMISSION_MAP),
);

/** Seeded demo super-admin profile for local UI when API/DB is unavailable. */
export function createSeedSuperAdminUser(): import('./contracts').IUser {
  return {
    id: 'seed-super-admin',
    email: 'admin@zarva.dev',
    phone: '09120000001',
    address: 'تهران، خیابان ولیعصر',
    name: 'مدیر کل',
    roleName: 'SUPER_ADMIN',
    permissions: [...ALL_PERMISSION_KEYS],
    organizationId: 'seed-org',
    branchId: null,
    locale: 'fa',
  };
}

/** Limited cashier for CASL contrast testing. */
export function createSeedCashierUser(): import('./contracts').IUser {
  return {
    id: 'seed-cashier',
    email: 'cashier@zarva.dev',
    phone: '09120000002',
    address: 'تهران، خیابان ولیعصر',
    name: 'صندوقدار',
    roleName: 'CASHIER',
    permissions: [
      'dashboard.read',
      'sales.read',
      'sales.create',
      'customers.read',
      'customers.create',
      'notifications.read',
    ],
    organizationId: 'seed-org',
    branchId: null,
    locale: 'fa',
  };
}
