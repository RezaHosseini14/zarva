import { ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';

import type { IAuthUser } from '../auth/auth.types';

jest.mock('./ai.rules', () => ({
  refreshLowStockInsights: jest.fn().mockResolvedValue(2),
}));

jest.mock('../notifications/domain-notification.publisher', () => ({
  DomainNotificationPublisher: class DomainNotificationPublisher {},
}));

import { AiService } from './ai.service';

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

describe('AiService', () => {
  const prisma = {
    aiInsight: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };
  const config = { get: jest.fn() };
  const domainNotifications = { notifyOrgUsers: jest.fn().mockResolvedValue(undefined) };
  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiService(prisma as never, config as never, domainNotifications as never);
  });

  it('requires ai.read', async () => {
    await expect(
      service.listInsights(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists insights', async () => {
    prisma.aiInsight.findMany.mockResolvedValue([
      {
        id: 'i1',
        title: 'Low',
        body: 'x',
        severity: 'warning',
        code: 'c',
        source: 'rules',
        createdAt: new Date('2026-01-01'),
      },
    ]);
    const rows = await service.listInsights(
      user({ roleName: 'VIEWER', permissions: ['ai.read'] }),
    );
    expect(rows[0]?.code).toBe('c');
  });

  it('refreshes rules', async () => {
    prisma.aiInsight.count.mockResolvedValue(0);
    const result = await service.refreshRules(
      user({ roleName: 'VIEWER', permissions: ['ai.manage'] }),
      {},
    );
    expect(result.created).toBe(2);
  });

  it('notifies on critical insights', async () => {
    prisma.aiInsight.count.mockResolvedValue(1);
    await service.refreshRules(user({ roleName: 'ORG_ADMIN', permissions: [] }), {});
    expect(domainNotifications.notifyOrgUsers).toHaveBeenCalled();
  });

  it('dismisses insight', async () => {
    prisma.aiInsight.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.aiInsight.update.mockResolvedValue({});
    await expect(
      service.dismiss(user({ roleName: 'VIEWER', permissions: ['ai.manage'] }), 'i1'),
    ).resolves.toEqual({ ok: true });
  });

  it('dismiss not found', async () => {
    prisma.aiInsight.findFirst.mockResolvedValue(null);
    await expect(
      service.dismiss(user({ roleName: 'VIEWER', permissions: ['ai.manage'] }), 'i9'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('capabilities without llm', () => {
    config.get.mockReturnValue(undefined);
    expect(service.capabilities()).toEqual({ rules: true, summarize: false });
  });

  it('summarize returns 503 without key', async () => {
    config.get.mockReturnValue(undefined);
    await expect(
      service.summarize(user({ roleName: 'ORG_ADMIN', permissions: [] }), { text: 'hello' }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('requires ai.manage to refresh', async () => {
    await expect(
      service.refreshRules(user({ roleName: 'VIEWER', permissions: ['ai.read'] }), {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('summarize fails when provider errors', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'AI_LLM_API_KEY' ? 'k' : 'm1',
    );
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    await expect(
      service.summarize(user({ roleName: 'ORG_ADMIN', permissions: [] }), { text: 'x' }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('summarize rejects empty provider payload', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'AI_LLM_API_KEY' ? 'k' : 'm1',
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    }) as unknown as typeof fetch;
    await expect(
      service.summarize(user({ roleName: 'ORG_ADMIN', permissions: [] }), { text: 'x' }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('summarize calls LLM when key present', async () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'AI_LLM_API_KEY') return 'k';
      if (key === 'AI_LLM_BASE_URL') return 'https://example.test/v1';
      if (key === 'AI_LLM_MODEL') return 'm1';
      return undefined;
    });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'summary text' } }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const result = await service.summarize(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      text: 'short',
    });
    expect(result).toEqual({ text: 'summary text', model: 'm1' });
    expect(fetchMock).toHaveBeenCalled();
  });
});
