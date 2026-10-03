import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canAccessSubject,
  createAppAbility,
  createSeedCashierUser,
  createSeedSuperAdminUser,
} from './authorization.js';

describe('createAppAbility', () => {
  it('grants manage all to SUPER_ADMIN', () => {
    const ability = createAppAbility({
      id: '1',
      roleName: 'SUPER_ADMIN',
      permissions: [],
    });
    assert.equal(ability.can('manage', 'all'), true);
    assert.equal(canAccessSubject(ability, 'Sale'), true);
  });

  it('grants manage all to ORG_ADMIN', () => {
    const ability = createAppAbility({
      id: '1',
      roleName: 'ORG_ADMIN',
      permissions: [],
    });
    assert.equal(ability.can('manage', 'all'), true);
  });

  it('maps permission strings to rules for cashier', () => {
    const cashier = createSeedCashierUser();
    const ability = createAppAbility(cashier);
    assert.equal(ability.can('create', 'Sale'), true);
    assert.equal(ability.can('read', 'Sale'), true);
    assert.equal(ability.can('delete', 'Sale'), false);
    assert.equal(canAccessSubject(ability, 'Sale'), true);
    assert.equal(canAccessSubject(ability, 'Role'), false);
  });

  it('seed super admin sees all nav subjects', () => {
    const ability = createAppAbility(createSeedSuperAdminUser());
    assert.equal(canAccessSubject(ability, 'Jewelry'), true);
    assert.equal(canAccessSubject(ability, 'Billing'), true);
  });
});
