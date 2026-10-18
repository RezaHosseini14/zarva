import { ConflictException } from '@nestjs/common';

import { ReportsService } from './reports.service';

describe('ReportsService day-close', () => {
  const dayClose = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const saleInvoice = { findMany: jest.fn().mockResolvedValue([]) };
  const purchase = { findMany: jest.fn().mockResolvedValue([]) };
  const salePayment = { findMany: jest.fn().mockResolvedValue([]) };
  const goldTxn = { findMany: jest.fn().mockResolvedValue([]) };
  const prisma = {
    dayClose,
    saleInvoice,
    purchase,
    salePayment,
    goldTxn,
  };
  const goldLedger = {
    stockAsOf: jest.fn().mockResolvedValue([{ purityKarat: 18, grams: 12 }]),
    listStockByKarat: jest.fn().mockResolvedValue([]),
  };

  const admin = {
    id: 'u1',
    email: 'a@b.c',
    phone: '09120000000',
    address: '—',
    name: 'A',
    organizationId: 'org1',
    branchId: null,
    locale: 'fa' as const,
    roleName: 'ORG_ADMIN',
    permissions: ['reports.read', 'reports.create'],
  };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(prisma as never, goldLedger as never);
  });

  it('returns frozen snapshot when day is closed', async () => {
    dayClose.findUnique.mockResolvedValue({
      id: 'd1',
      reopenedAt: null,
      closedAt: new Date('2026-10-03T18:00:00Z'),
      summaryJson: {
        businessDate: '2026-10-03',
        salesCount: 2,
        buybacksCount: 0,
        purchasesCount: 1,
        salesAmountIrt: 100,
        buybacksAmountIrt: 0,
        purchasesAmountIrt: 50,
        cashInIrt: 100,
        cashOutIrt: 50,
        metal: [{ purityKarat: 18, gramsIn: 0, gramsOut: 1, closingGrams: 9 }],
        closedAt: null,
      },
    });

    const summary = await service.getDayClose(admin, '2026-10-03', false);
    expect(summary.salesCount).toBe(2);
    expect(summary.closedAt).toBeTruthy();
    expect(goldLedger.stockAsOf).not.toHaveBeenCalled();
  });

  it('computes live closingGrams from ledger as-of when open', async () => {
    dayClose.findUnique.mockResolvedValue(null);
    const summary = await service.getDayClose(admin, '2026-10-03', false);
    expect(goldLedger.stockAsOf).toHaveBeenCalled();
    expect(summary.metal[0]?.closingGrams).toBe(12);
    expect(summary.closedAt).toBeNull();
  });

  it('requires reason to reopen', async () => {
    dayClose.findUnique.mockResolvedValue({
      id: 'd1',
      reopenedAt: null,
      closedAt: new Date(),
      summaryJson: { businessDate: '2026-10-03' },
    });
    await expect(
      service.reopenDayClose(admin, '2026-10-03', '  '),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
