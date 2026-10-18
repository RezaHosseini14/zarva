import { BadRequestException, ConflictException } from '@nestjs/common';

jest.mock('./sale-sms.notifier', () => ({
  SaleSmsNotifier: class SaleSmsNotifier {
    notify = jest.fn();
  },
}));

import { SalesService } from './sales.service';

describe('SalesService ledger hooks', () => {
  const saleSms = { notify: jest.fn() };
  const goldLedger = {
    getLockedRate: jest.fn(),
    assertBusinessDayOpen: jest.fn().mockResolvedValue(undefined),
    postSaleOut: jest.fn(),
    postBuybackIn: jest.fn(),
    reverseBySource: jest.fn(),
  };

  const prisma: {
    customer: { findFirst: jest.Mock };
    organization: { findUnique: jest.Mock };
    orgSetting: { findUnique: jest.Mock };
    saleInvoice: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    salePayment: { create: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  } = {
    customer: { findFirst: jest.fn() },
    organization: { findUnique: jest.fn().mockResolvedValue({ id: 'org1', name: 'Shop' }) },
    orgSetting: { findUnique: jest.fn().mockResolvedValue(null) },
    saleInvoice: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    salePayment: { create: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
  );

  let service: SalesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SalesService(prisma as never, saleSms as never, goldLedger as never);
  });

  it('requires locked rate when confirming', async () => {
    prisma.customer.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'A',
      phone: '09121234567',
      address: 'x',
      nationalId: null,
    });
    goldLedger.getLockedRate.mockRejectedValue(
      new ConflictException('Daily gold rate is not locked for this date'),
    );

    await expect(
      service.createInvoice(
        {
          id: 'u1',
          email: 'a@b.c',
          phone: '09120000000',
          address: '—',
          name: 'A',
          organizationId: 'org1',
          branchId: null,
          locale: 'fa',
          roleName: 'ORG_ADMIN',
          permissions: ['sales.create'],
        },
        {
          customerId: 'c1',
          number: 'INV-1',
          confirm: true,
          goldWeightGrams: 10,
          amountIRT: 1000,
        },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('checkout posts ledger and payments atomically', async () => {
    prisma.customer.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'A',
      phone: '09121234567',
      address: 'x',
      nationalId: null,
    });
    goldLedger.getLockedRate.mockResolvedValue({
      id: 'r1',
      businessDate: '2026-10-03',
      buyRateIrt: 1000,
      sellRateIrt: 1100,
      lockedAt: new Date().toISOString(),
      label: 'x',
    });
    const invoice = {
      id: 'inv1',
      number: 'POS-1',
      documentKind: 'sale',
      status: 'confirmed',
      paymentStatus: 'paid',
      goldWeightGrams: 10,
      amountIRT: 8250,
      remainingIRT: 0,
      seller: '—',
      displayDate: '2026-10-03',
      amountLabel: '8250',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: 'org1',
      customer: {
        id: 'c1',
        name: 'A',
        phone: '09121234567',
        address: 'x',
        nationalId: null,
      },
      lines: [],
    };
    prisma.saleInvoice.create.mockResolvedValue({
      ...invoice,
      lines: [
        {
          id: 'l1',
          description: 'x',
          weight: '10',
          purity: '18',
          dailyRate: '1100',
          goldValue: '8250',
          wage: '0',
          profit: '0',
          tax: '0',
          lineTotal: '8250',
          weightGrams: 10,
          purityKarat: 18,
          rateIrt: 1100,
        },
      ],
    });
    prisma.saleInvoice.update.mockResolvedValue(invoice);
    prisma.saleInvoice.findFirst.mockResolvedValue(invoice);
    prisma.salePayment.create.mockResolvedValue({
      id: 'pay1',
      invoiceId: 'inv1',
      ref: 'PAY-1',
      method: 'cash',
      amountIrt: 8250,
      displayDate: '2026-10-03',
      createdAt: new Date(),
    });

    const result = await service.checkout(
      {
        id: 'u1',
        email: 'a@b.c',
        phone: '09120000000',
        address: '—',
        name: 'A',
        organizationId: 'org1',
        branchId: null,
        locale: 'fa',
        roleName: 'ORG_ADMIN',
        permissions: ['sales.create'],
      },
      {
        customerId: 'c1',
        number: 'POS-1',
        documentKind: 'sale',
        displayDate: '2026-10-03',
        lines: [
          {
            description: 'x',
            weightGrams: 10,
            purityKarat: 18,
            rateIrt: 1,
          },
        ],
        payments: [{ method: 'cash', amountIrt: 8250 }],
      },
    );

    expect(result.invoice.id).toBe('inv1');
    expect(goldLedger.postSaleOut).toHaveBeenCalled();
    expect(prisma.salePayment.create).toHaveBeenCalled();
  });

  it('rejects empty invoice amounts', async () => {
    prisma.customer.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'A',
      phone: '09121234567',
      address: 'x',
      nationalId: null,
    });

    await expect(
      service.createInvoice(
        {
          id: 'u1',
          email: 'a@b.c',
          phone: '09120000000',
          address: '—',
          name: 'A',
          organizationId: 'org1',
          branchId: null,
          locale: 'fa',
          roleName: 'ORG_ADMIN',
          permissions: ['sales.create'],
        },
        {
          customerId: 'c1',
          number: 'INV-2',
          lines: [],
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

