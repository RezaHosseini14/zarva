import { ForbiddenException } from '@nestjs/common';

jest.mock('../auth/auth.service', () => ({
  AuthService: class AuthService {},
}));
jest.mock('../billing/billing.service', () => ({
  BillingService: class BillingService {},
}));
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { NavigationService } from './navigation.service';

describe('NavigationService.assertSuperAdmin', () => {
  const service = new NavigationService({} as never, {} as never, {} as never);

  it('allows SUPER_ADMIN', () => {
    expect(() =>
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
    ).not.toThrow();
  });

  it('rejects PLATFORM_ADMIN', () => {
    expect(() =>
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
    ).toThrow(ForbiddenException);
  });
});
