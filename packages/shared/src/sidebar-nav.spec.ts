import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createSeedCashierUser,
  createSeedSuperAdminUser,
} from './authorization.js';
import type { IPlanEntitlements } from './billing.js';
import {
  SIDEBAR_NAV_SEED,
  buildSidebarNavTree,
  filterSidebarNavTree,
  type ISidebarNavFlatRow,
} from './sidebar-nav.js';

function seedRows(): ISidebarNavFlatRow[] {
  return SIDEBAR_NAV_SEED.map((item) => ({
    id: item.key,
    key: item.key,
    parentId: null,
    href: item.href,
    labelKey: item.labelKey,
    icon: item.icon,
    iconActive: item.iconActive,
    group: item.group,
    subject: item.subject,
    roles: item.roles ?? [],
    moduleKey: item.moduleKey ?? null,
    sortOrder: item.sortOrder,
    isActive: true,
  }));
}

const FULL: IPlanEntitlements = {
  maxUsers: 10,
  maxBranches: 2,
  maxStorageMb: 1000,
  modules: ['*'],
  features: [],
  trialDays: 0,
  graceDaysPastDue: 0,
};

describe('filterSidebarNavTree', () => {
  it('lets SUPER_ADMIN see platform navigation', () => {
    const tree = buildSidebarNavTree(seedRows());
    const filtered = filterSidebarNavTree(tree, createSeedSuperAdminUser(), FULL);
    const hrefs = filtered.map((n) => n.href);
    assert.ok(hrefs.includes('/platform/navigation'));
    assert.ok(hrefs.includes('/sales'));
  });

  it('hides platform routes from cashier', () => {
    const tree = buildSidebarNavTree(seedRows());
    const filtered = filterSidebarNavTree(tree, createSeedCashierUser(), FULL);
    const hrefs = filtered.map((n) => n.href);
    assert.equal(hrefs.includes('/platform/organizations'), false);
    assert.equal(hrefs.includes('/platform/navigation'), false);
    assert.ok(hrefs.includes('/sales') || hrefs.includes('/dashboard'));
  });

  it('gates moduleKey by entitlements before CASL', () => {
    const tree = buildSidebarNavTree(seedRows());
    const limited: IPlanEntitlements = {
      ...FULL,
      modules: ['dashboard', 'sales'],
    };
    const filtered = filterSidebarNavTree(tree, createSeedSuperAdminUser(), limited);
    const hrefs = filtered.map((n) => n.href);
    assert.equal(hrefs.includes('/jewelry'), false);
    assert.equal(hrefs.includes('/workshop'), false);
  });
});
