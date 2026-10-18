import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommerceService } from './commerce.service';
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

describe('CommerceService', () => {
  const prisma = {
    commerceChannel: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    commerceListing: { create: jest.fn(), count: jest.fn() },
    inventoryItem: { findFirst: jest.fn() },
  };
  let service: CommerceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommerceService(prisma as never);
  });

  it('denies read without permission', async () => {
    await expect(
      service.summary(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns summary counts', async () => {
    prisma.commerceChannel.findMany.mockResolvedValue([
      { status: 'active' },
      { status: 'draft' },
    ]);
    prisma.commerceListing.count.mockResolvedValue(3);
    const s = await service.summary(user({ roleName: 'ORG_ADMIN', permissions: [] }));
    expect(s.channels).toBe(2);
    expect(s.activeChannels).toBe(1);
    expect(s.listings).toBe(3);
  });

  it('creates channel', async () => {
    prisma.commerceChannel.create.mockResolvedValue({
      id: 'c1',
      name: 'IG',
      type: 'instagram',
      status: 'draft',
      _count: { listings: 0 },
    });
    const row = await service.createChannel(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      name: 'IG',
    });
    expect(row.type).toBe('instagram');
  });

  it('updates channel', async () => {
    prisma.commerceChannel.findFirst.mockResolvedValue({ id: 'c1', organizationId: 'org1' });
    prisma.commerceChannel.update.mockResolvedValue({
      id: 'c1',
      name: 'Renamed',
      type: 'whatsapp',
      status: 'active',
      _count: { listings: 1 },
    });
    const row = await service.updateChannel(
      user({ roleName: 'VIEWER', permissions: ['commerce.manage'] }),
      'c1',
      { name: 'Renamed', status: 'active' },
    );
    expect(row.a).toBe('Renamed');
  });

  it('throws when channel missing on update', async () => {
    prisma.commerceChannel.findFirst.mockResolvedValue(null);
    await expect(
      service.updateChannel(
        user({ roleName: 'ORG_ADMIN', permissions: [] }),
        'x',
        { name: 'N' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates listing when inventory exists', async () => {
    prisma.commerceChannel.findFirst.mockResolvedValue({ id: 'c1', organizationId: 'org1' });
    prisma.inventoryItem.findFirst.mockResolvedValue({ id: 'i1', name: 'Ring', sku: 'R1' });
    prisma.commerceListing.create.mockResolvedValue({
      id: 'l1',
      channelId: 'c1',
      inventoryItemId: 'i1',
      status: 'active',
      externalSku: '',
      inventoryItem: { name: 'Ring', sku: 'R1' },
    });
    const row = await service.createListing(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      channelId: 'c1',
      inventoryItemId: 'i1',
    });
    expect(prisma.commerceListing.create.mock.calls[0]?.[0]?.data).not.toHaveProperty('syncedAt');
    expect(row.a).toBe('Ring');
  });

  it('rejects listing without inventory item', async () => {
    prisma.commerceChannel.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.inventoryItem.findFirst.mockResolvedValue(null);
    await expect(
      service.createListing(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
        channelId: 'c1',
        inventoryItemId: 'i1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists channels', async () => {
    prisma.commerceChannel.findMany.mockResolvedValue([
      {
        id: 'c1',
        name: 'WA',
        type: 'whatsapp',
        status: 'active',
        _count: { listings: 2 },
      },
    ]);
    const rows = await service.listChannels(
      user({ roleName: 'VIEWER', permissions: ['commerce.read'] }),
    );
    expect(rows[0]?.listingCount).toBe(2);
  });

  it('denies write without commerce.manage', async () => {
    await expect(
      service.createChannel(user({ roleName: 'VIEWER', permissions: ['commerce.read'] }), {
        name: 'X',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('removes channel', async () => {
    prisma.commerceChannel.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.commerceChannel.delete.mockResolvedValue({});
    await expect(
      service.removeChannel(user({ roleName: 'VIEWER', permissions: ['commerce.manage'] }), 'c1'),
    ).resolves.toEqual({ ok: true });
  });
});
