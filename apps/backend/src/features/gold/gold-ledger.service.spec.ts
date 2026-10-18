import { BadRequestException, ConflictException } from '@nestjs/common';

import { GoldLedgerService } from './gold-ledger.service';

describe('GoldLedgerService', () => {
  const goldOrgRate = {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const goldRateCorrection = {
    create: jest.fn(),
    findMany: jest.fn(),
  };
  const goldTxn = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  };
  const goldBalance = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const dayClose = {
    findUnique: jest.fn(),
  };

  const prisma: {
    goldOrgRate: typeof goldOrgRate;
    goldRateCorrection: typeof goldRateCorrection;
    goldTxn: typeof goldTxn;
    goldBalance: typeof goldBalance;
    dayClose: typeof dayClose;
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
  } = {
    goldOrgRate,
    goldRateCorrection,
    goldTxn,
    goldBalance,
    dayClose,
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: typeof prisma) => Promise<unknown>)(prisma);
      }
      if (Array.isArray(fn)) {
        return Promise.all(fn);
      }
      return fn;
    },
  );

  let service: GoldLedgerService;

  beforeEach(() => {
    jest.clearAllMocks();
    dayClose.findUnique.mockResolvedValue(null);
    prisma.$queryRaw.mockResolvedValue([]);
    service = new GoldLedgerService(prisma as never);
  });

  it('locks rate for a business date', async () => {
    goldOrgRate.findFirst.mockResolvedValue(null);
    goldOrgRate.create.mockResolvedValue({
      id: 'r1',
      label: 'نرخ 2026-10-03',
      buyRateIrt: 1000,
      sellRateIrt: 1100,
      businessDate: new Date('2026-10-03'),
      lockedAt: new Date('2026-10-03T08:00:00Z'),
    });

    const locked = await service.lockRate('org1', {
      businessDate: '2026-10-03',
      buyRateIrt: 1000,
      sellRateIrt: 1100,
    });

    expect(locked.buyRateIrt).toBe(1000);
    expect(locked.sellRateIrt).toBe(1100);
    expect(goldOrgRate.create).toHaveBeenCalled();
  });

  it('rejects double lock', async () => {
    goldOrgRate.findFirst.mockResolvedValue({
      id: 'r1',
      lockedAt: new Date(),
    });
    await expect(
      service.lockRate('org1', {
        businessDate: '2026-10-03',
        buyRateIrt: 1,
        sellRateIrt: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('corrects locked rate with audit', async () => {
    goldOrgRate.findFirst.mockResolvedValue({
      id: 'r1',
      lockedAt: new Date(),
      buyRateIrt: 1000,
      sellRateIrt: 1100,
      label: 'x',
      businessDate: new Date('2026-10-03'),
    });
    goldOrgRate.update.mockResolvedValue({
      id: 'r1',
      label: 'x',
      buyRateIrt: 1200,
      sellRateIrt: 1300,
      businessDate: new Date('2026-10-03'),
      lockedAt: new Date(),
    });
    goldRateCorrection.create.mockResolvedValue({});

    const next = await service.correctRate('org1', 'u1', {
      businessDate: '2026-10-03',
      buyRateIrt: 1200,
      sellRateIrt: 1300,
      reason: 'typo fix',
    });
    expect(next.buyRateIrt).toBe(1200);
  });

  it('posts purchase in and increases stock', async () => {
    goldTxn.findFirst.mockResolvedValue(null);
    prisma.$queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'b1', grams: 0 }]);
    goldBalance.create.mockResolvedValue({});
    goldBalance.update.mockResolvedValue({});
    goldTxn.create.mockResolvedValue({});

    await service.postPurchaseIn(
      'org1',
      'p1',
      [{ grams: 10, purityKarat: 18, rateIrt: 100, counterparty: 'Supplier' }],
      '2026-10-03',
    );

    expect(goldBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ grams: 10 }),
      }),
    );
  });

  it('blocks sale out when stock insufficient', async () => {
    goldTxn.findFirst.mockResolvedValue(null);
    prisma.$queryRaw.mockResolvedValue([{ id: 'b1', grams: 1 }]);

    await expect(
      service.postSaleOut(
        'org1',
        's1',
        [{ grams: 5, purityKarat: 18, rateIrt: 100, counterparty: 'C' }],
        '2026-10-03',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reverses using original displayDate', async () => {
    goldTxn.findMany.mockResolvedValue([
      {
        id: 't1',
        grams: 5,
        purityKarat: 18,
        direction: 'in',
        displayDate: '2026-10-01',
        typeLabel: 'خرید',
        counterparty: 'S',
        reference: 'purchase:p1:0',
        rateIrt: 100,
      },
    ]);
    goldTxn.findFirst.mockResolvedValue(null);
    prisma.$queryRaw.mockResolvedValue([{ id: 'b1', grams: 5 }]);
    goldBalance.update.mockResolvedValue({});
    goldTxn.create.mockResolvedValue({});

    await service.reverseBySource('org1', 'purchase', 'p1');

    expect(goldTxn.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ displayDate: '2026-10-01' }),
      }),
    );
  });

  it('partial reverse respects remaining grams', async () => {
    goldTxn.findMany
      .mockResolvedValueOnce([
        {
          id: 't1',
          grams: 10,
          purityKarat: 18,
          direction: 'in',
          displayDate: '2026-10-01',
          typeLabel: 'خرید',
          counterparty: 'S',
          reference: 'purchase:p1:0',
          rateIrt: 100,
        },
      ])
      .mockResolvedValueOnce([]);
    prisma.$queryRaw.mockResolvedValue([{ id: 'b1', grams: 10 }]);
    goldBalance.update.mockResolvedValue({});
    goldTxn.create.mockResolvedValue({});

    await service.reverseBySourcePartial('org1', 'purchase', 'p1', [
      { purityKarat: 18, grams: 4 },
    ]);

    expect(goldBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ grams: 6 }),
      }),
    );
  });

  it('requires adjust reason', async () => {
    await expect(
      service.postAdjust('org1', {
        grams: 1,
        purityKarat: 18,
        direction: 'in',
        reason: '  ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks ops when day is closed', async () => {
    dayClose.findUnique.mockResolvedValue({
      id: 'd1',
      reopenedAt: null,
    });
    await expect(
      service.lockRate('org1', {
        businessDate: '2026-10-03',
        buyRateIrt: 1,
        sellRateIrt: 2,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
