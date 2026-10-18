import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ForbiddenException } from '@nestjs/common';

import { NavigationService } from './navigation.service';

describe('NavigationService.assertSuperAdmin', () => {
  it('allows SUPER_ADMIN', () => {
    const service = new NavigationService(
      {} as never,
      {} as never,
      {} as never,
    );
    assert.doesNotThrow(() =>
      service.assertSuperAdmin({
        id: '1',
        email: 'a@b.c',
        phone: '',
        address: '',
        name: 'Admin',
        roleName: 'SUPER_ADMIN',
        permissions: [],
        organizationId: 'org',
        branchId: null,
        locale: 'fa',
      }),
    );
  });

  it('rejects PLATFORM_ADMIN', () => {
    const service = new NavigationService(
      {} as never,
      {} as never,
      {} as never,
    );
    assert.throws(
      () =>
        service.assertSuperAdmin({
          id: '1',
          email: 'a@b.c',
          phone: '',
          address: '',
          name: 'Admin',
          roleName: 'PLATFORM_ADMIN',
          permissions: [],
          organizationId: 'org',
          branchId: null,
          locale: 'fa',
        }),
      ForbiddenException,
    );
  });
});
