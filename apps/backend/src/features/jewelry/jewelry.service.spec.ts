import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { JewelryService } from './jewelry.service';
import type { IAuthUser } from '../auth/auth.types';

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

describe('JewelryService', () => {
  const prisma = {
    jewelryPiece: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    jewelryBomLine: { findMany: jest.fn(), create: jest.fn() },
    jewelryReservation: { findFirst: jest.fn(), create: jest.fn() },
  };
  let service: JewelryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JewelryService(prisma as never);
  });

  it('requires jewelry.read', async () => {
    await expect(
      service.listPieces(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists pieces', async () => {
    prisma.jewelryPiece.findMany.mockResolvedValue([
      {
        id: 'p1',
        title: 'Ring',
        sku: 'R1',
        status: 'showcase',
        weight: '',
        purity: '',
        inventoryItemId: null,
      },
    ]);
    const rows = await service.listPieces(
      user({ roleName: 'VIEWER', permissions: ['jewelry.read'] }),
    );
    expect(rows).toHaveLength(1);
  });

  it('creates piece', async () => {
    prisma.jewelryPiece.create.mockResolvedValue({
      id: 'p1',
      title: 'Ring',
      sku: 'R1',
      status: 'showcase',
      weight: '1',
      purity: '18',
      inventoryItemId: null,
    });
    const row = await service.createPiece(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      title: 'Ring',
      sku: 'R1',
    });
    expect(row.sku).toBe('R1');
  });

  it('adds bom line', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1', organizationId: 'org1' });
    prisma.jewelryBomLine.create.mockResolvedValue({
      id: 'b1',
      componentType: 'stone',
      description: 'Ruby',
      weight: '0.1',
      carat: '0.5',
      qty: 1,
    });
    const row = await service.addBomLine(
      user({ roleName: 'ORG_ADMIN', permissions: [] }),
      'p1',
      { componentType: 'stone', description: 'Ruby' },
    );
    expect(row.componentType).toBe('stone');
  });

  it('conflicts on active reservation', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1', organizationId: 'org1' });
    prisma.jewelryReservation.findFirst.mockResolvedValue({ id: 'r1' });
    await expect(
      service.createReservation(
        user({ roleName: 'ORG_ADMIN', permissions: [] }),
        'p1',
        { reservedUntil: '2030-01-01T00:00:00.000Z' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates reservation', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1', organizationId: 'org1' });
    prisma.jewelryReservation.findFirst.mockResolvedValue(null);
    prisma.jewelryReservation.create.mockResolvedValue({
      id: 'r1',
      pieceId: 'p1',
      customerId: null,
      reservedUntil: new Date('2030-01-01'),
      status: 'active',
    });
    prisma.jewelryPiece.update.mockResolvedValue({});
    const row = await service.createReservation(
      user({ roleName: 'ORG_ADMIN', permissions: [] }),
      'p1',
      { reservedUntil: '2030-01-01T00:00:00.000Z' },
    );
    expect(row.status).toBe('active');
  });

  it('not found piece', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue(null);
    await expect(
      service.removePiece(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'p9'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists bom lines', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.jewelryBomLine.findMany.mockResolvedValue([]);
    await expect(
      service.listBomLines(user({ roleName: 'VIEWER', permissions: ['jewelry.read'] }), 'p1'),
    ).resolves.toEqual([]);
  });

  it('deletes piece', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.jewelryPiece.delete.mockResolvedValue({});
    await expect(
      service.removePiece(user({ roleName: 'VIEWER', permissions: ['jewelry.manage'] }), 'p1'),
    ).resolves.toEqual({ ok: true });
  });

  it('denies write without jewelry.manage', async () => {
    await expect(
      service.createPiece(user({ roleName: 'VIEWER', permissions: ['jewelry.read'] }), {
        title: 'X',
        sku: 'S',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates piece', async () => {
    prisma.jewelryPiece.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.jewelryPiece.update.mockResolvedValue({
      id: 'p1',
      title: 'X',
      sku: 'S',
      status: 'sold',
      weight: '',
      purity: '',
      inventoryItemId: null,
    });
    const row = await service.updatePiece(
      user({ roleName: 'VIEWER', permissions: ['jewelry.manage'] }),
      'p1',
      { status: 'sold' },
    );
    expect(row.status).toBe('sold');
  });
});
