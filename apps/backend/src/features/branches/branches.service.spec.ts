import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { IAuthUser } from '../auth/auth.types';

jest.mock('../billing/billing.service', () => ({
  BillingService: class BillingService {},
}));

import { BranchesService } from './branches.service';

function user(partial: Partial<IAuthUser> & Pick<IAuthUser, 'roleName' | 'permissions'>): IAuthUser {
  return {
    id: 'u1',
    email: 'a@b.c',
    phone: '09120000000',
    address: '—',
    name: 'A',
    organizationId: 'org1',
    branchId: null,
    locale: 'fa',
    ...partial,
  };
}

describe('BranchesService', () => {
  const billing = { resolveEntitlements: jest.fn() };
  const prisma = {
    branch: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: { findFirst: jest.fn(), update: jest.fn() },
  };
  let service: BranchesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BranchesService(prisma as never, billing as never);
    billing.resolveEntitlements.mockResolvedValue({ maxBranches: 5 });
  });

  it('forbids list without branches.read', async () => {
    await expect(
      service.list(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists branches for admin', async () => {
    prisma.branch.findMany.mockResolvedValue([
      {
        id: 'b1',
        name: 'Main',
        code: 'M1',
        city: 'Tehran',
        address: '',
        isActive: true,
        _count: { users: 2 },
      },
    ]);
    const rows = await service.list(user({ roleName: 'ORG_ADMIN', permissions: [] }));
    expect(rows[0]?.userCount).toBe(2);
    expect(rows[0]?.a).toBe('Main');
  });

  it('blocks create when branch quota reached', async () => {
    prisma.branch.count.mockResolvedValue(5);
    await expect(
      service.create(user({ roleName: 'ORG_ADMIN', permissions: [] }), { name: 'X' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates branch when under quota', async () => {
    prisma.branch.count.mockResolvedValue(0);
    prisma.branch.create.mockResolvedValue({
      id: 'b2',
      name: 'North',
      code: '',
      city: '',
      address: '',
      isActive: true,
      _count: { users: 0 },
    });
    const row = await service.create(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      name: 'North',
    });
    expect(row.id).toBe('b2');
  });

  it('throws when branch not found', async () => {
    prisma.branch.findFirst.mockResolvedValue(null);
    await expect(
      service.get(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents delete when users assigned', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      organizationId: 'org1',
      _count: { users: 1 },
    });
    await expect(
      service.remove(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'b1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assigns user to branch', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      organizationId: 'org1',
      _count: { users: 0 },
    });
    prisma.user.findFirst.mockResolvedValue({ id: 'u2' });
    prisma.user.update.mockResolvedValue({});
    const result = await service.assignUser(
      user({ roleName: 'ORG_ADMIN', permissions: [] }),
      'b1',
      { userId: 'u2' },
    );
    expect(result.ok).toBe(true);
  });

  it('requires branches.manage for assign', async () => {
    await expect(
      service.assignUser(
        user({ roleName: 'VIEWER', permissions: ['branches.read'] }),
        'b1',
        { userId: 'u2' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('gets branch by id', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      name: 'Main',
      code: '',
      city: '',
      address: 'Addr',
      isActive: true,
      _count: { users: 0 },
    });
    const row = await service.get(
      user({ roleName: 'VIEWER', permissions: ['branches.read'] }),
      'b1',
    );
    expect(row.c).toBe('Addr');
  });

  it('updates branch', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      organizationId: 'org1',
      _count: { users: 0 },
    });
    prisma.branch.update.mockResolvedValue({
      id: 'b1',
      name: 'Renamed',
      code: 'R',
      city: 'City',
      address: '',
      isActive: false,
      _count: { users: 0 },
    });
    const row = await service.update(
      user({ roleName: 'VIEWER', permissions: ['branches.manage'] }),
      'b1',
      { name: 'Renamed', isActive: false },
    );
    expect(row.a).toBe('Renamed');
  });

  it('deletes empty branch', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      organizationId: 'org1',
      _count: { users: 0 },
    });
    prisma.branch.delete.mockResolvedValue({});
    await expect(
      service.remove(user({ roleName: 'VIEWER', permissions: ['branches.manage'] }), 'b1'),
    ).resolves.toEqual({ ok: true });
  });

  it('assign fails when user missing', async () => {
    prisma.branch.findFirst.mockResolvedValue({
      id: 'b1',
      organizationId: 'org1',
      _count: { users: 0 },
    });
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.assignUser(
        user({ roleName: 'VIEWER', permissions: ['branches.manage'] }),
        'b1',
        { userId: 'u9' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
