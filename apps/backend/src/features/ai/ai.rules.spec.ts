import { refreshLowStockInsights } from './ai.rules';

describe('refreshLowStockInsights', () => {
  it('creates insights for low qty items', async () => {
    const prisma = {
      inventoryItem: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'i1', name: 'Ring', sku: 'R1', qty: 0 },
        ]),
      },
      aiInsight: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const created = await refreshLowStockInsights(prisma as never, 'org1', { thresholdQty: 2 });
    expect(created).toBe(1);
    expect(prisma.aiInsight.create).toHaveBeenCalled();
  });

  it('skips existing active insight', async () => {
    const prisma = {
      inventoryItem: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'i1', name: 'Ring', sku: 'R1', qty: 1 },
        ]),
      },
      aiInsight: {
        findFirst: jest.fn().mockResolvedValue({ id: 'x' }),
        create: jest.fn(),
      },
    };
    const created = await refreshLowStockInsights(prisma as never, 'org1');
    expect(created).toBe(0);
  });
});
