import { ForbiddenException } from '@nestjs/common';

import { IntegrationsService } from './integrations.service';
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

describe('IntegrationsService', () => {
  const prisma = {
    integration: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    orgApiKey: { count: jest.fn() },
  };
  let service: IntegrationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IntegrationsService(prisma as never);
  });

  it('summary aggregates status and kinds', async () => {
    prisma.integration.findMany.mockResolvedValue([
      { kind: 'scale', status: 'healthy' },
      { kind: 'scale', status: 'offline' },
      { kind: 'api', status: 'degraded' },
    ]);
    prisma.orgApiKey.count.mockResolvedValue(2);
    const s = await service.summary(user({ roleName: 'ORG_ADMIN', permissions: [] }));
    expect(s.total).toBe(3);
    expect(s.healthy).toBe(1);
    expect(s.degraded).toBe(1);
    expect(s.offline).toBe(1);
    expect(s.apiKeys).toBe(2);
    expect(s.byKind).toEqual(
      expect.arrayContaining([
        { kind: 'scale', count: 2 },
        { kind: 'api', count: 1 },
      ]),
    );
  });

  it('requires integrations.read for summary', async () => {
    await expect(
      service.summary(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('test marks scale offline when config empty', async () => {
    prisma.integration.findFirst.mockResolvedValue({
      id: 'i1',
      kind: 'scale',
      config: {},
    });
    prisma.integration.update.mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: 'i1',
        kind: 'scale',
        code: 'S1',
        status: String(args.data.status),
        detail: String(args.data.detail ?? ''),
      }),
    );
    const row = await service.test(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'i1');
    expect(row.status).toBe('offline');
  });

  it('test marks device healthy when configured', async () => {
    prisma.integration.findFirst.mockResolvedValue({
      id: 'i2',
      kind: 'device',
      config: { port: 'COM3' },
    });
    prisma.integration.update.mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: 'i2',
        kind: 'device',
        code: 'D1',
        status: String(args.data.status),
        detail: String(args.data.detail ?? ''),
      }),
    );
    const row = await service.test(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'i2');
    expect(row.status).toBe('healthy');
  });
});
