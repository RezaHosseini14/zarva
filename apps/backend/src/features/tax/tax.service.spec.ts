import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { IAuthUser } from '../auth/auth.types';

jest.mock('./tax.authority.adapter', () => ({
  TaxAuthorityAdapter: class TaxAuthorityAdapter {
    submit = jest.fn();
  },
}));

import { TaxService } from './tax.service';

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

describe('TaxService', () => {
  const authority = { submit: jest.fn() };
  const prisma = {
    taxPeriod: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    taxFiling: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    saleInvoice: { findMany: jest.fn() },
  };
  let service: TaxService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaxService(prisma as never, authority as never);
  });

  it('requires tax.read', async () => {
    await expect(
      service.listPeriods(user({ roleName: 'VIEWER', permissions: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects invalid period range', async () => {
    await expect(
      service.createPeriod(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
        label: 'P',
        fromDate: '2026-02-01',
        toDate: '2026-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates period', async () => {
    prisma.taxPeriod.create.mockResolvedValue({
      id: 'p1',
      label: 'P',
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-02-01'),
      status: 'open',
    });
    const row = await service.createPeriod(user({ roleName: 'ORG_ADMIN', permissions: [] }), {
      label: 'P',
      fromDate: '2026-01-01',
      toDate: '2026-02-01',
    });
    expect(row.status).toBe('open');
  });

  it('generates filing from invoices', async () => {
    prisma.taxPeriod.findFirst.mockResolvedValue({
      id: 'p1',
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-02-01'),
      label: 'P',
    });
    prisma.saleInvoice.findMany.mockResolvedValue([
      {
        number: 'S1',
        amountIRT: new Prisma.Decimal(100),
        goldWeightGrams: new Prisma.Decimal(1),
        status: 'confirmed',
      },
    ]);
    prisma.taxFiling.create.mockResolvedValue({
      id: 'f1',
      periodId: 'p1',
      kind: 'vat',
      status: 'ready',
      totals: { invoiceCount: 1 },
    });
    const row = await service.generateFiling(
      user({ roleName: 'ORG_ADMIN', permissions: [] }),
      'p1',
      {},
    );
    expect(row.kind).toBe('vat');
  });

  it('exports filing csv', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue({
      id: 'f1',
      kind: 'vat',
      totals: { x: 1 },
      period: { label: 'P' },
      lines: [{ label: 'L', amount: '1' }],
    });
    prisma.taxFiling.update.mockResolvedValue({});
    const result = await service.exportFiling(
      user({ roleName: 'VIEWER', permissions: ['tax.read'] }),
      'f1',
      'csv',
    );
    expect(result.format).toBe('csv');
  });

  it('submit propagates 503 from authority', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue({
      id: 'f1',
      artifact: '',
      totals: {},
      period: { label: 'P' },
    });
    authority.submit.mockRejectedValue(new HttpException('x', HttpStatus.SERVICE_UNAVAILABLE));
    await expect(
      service.submitFiling(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'f1'),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('closes period', async () => {
    prisma.taxPeriod.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.taxPeriod.update.mockResolvedValue({
      id: 'p1',
      label: 'P',
      fromDate: new Date(),
      toDate: new Date(),
      status: 'closed',
    });
    const row = await service.closePeriod(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'p1');
    expect(row.status).toBe('closed');
  });

  it('lists filings', async () => {
    prisma.taxFiling.findMany.mockResolvedValue([
      {
        id: 'f1',
        periodId: 'p1',
        kind: 'vat',
        status: 'draft',
        totals: {},
        period: { label: 'P' },
      },
    ]);
    const rows = await service.listFilings(
      user({ roleName: 'VIEWER', permissions: ['tax.read'] }),
    );
    expect(rows).toHaveLength(1);
  });

  it('exports filing as xml', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue({
      id: 'f1',
      kind: 'vat',
      totals: {},
      period: { label: 'P' },
      lines: [],
    });
    prisma.taxFiling.update.mockResolvedValue({});
    const result = await service.exportFiling(
      user({ roleName: 'VIEWER', permissions: ['tax.read'] }),
      'f1',
      'xml',
    );
    expect(result.format).toBe('xml');
  });

  it('submits filing when authority accepts', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue({
      id: 'f1',
      artifact: 'body',
      totals: { a: 1 },
      period: { label: 'P' },
    });
    authority.submit.mockResolvedValue({ reference: 'REF', submittedAt: new Date().toISOString() });
    prisma.taxFiling.update.mockResolvedValue({
      id: 'f1',
      periodId: 'p1',
      kind: 'vat',
      status: 'submitted',
      totals: { authorityReference: 'REF' },
    });
    const row = await service.submitFiling(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'f1');
    expect(row.status).toBe('submitted');
  });

  it('export filing not found', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue(null);
    await expect(
      service.exportFiling(
        user({ roleName: 'VIEWER', permissions: ['tax.read'] }),
        'f9',
        'csv',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists periods', async () => {
    prisma.taxPeriod.findMany.mockResolvedValue([
      {
        id: 'p1',
        label: 'P',
        fromDate: new Date(),
        toDate: new Date(),
        status: 'open',
      },
    ]);
    const rows = await service.listPeriods(
      user({ roleName: 'VIEWER', permissions: ['tax.read'] }),
    );
    expect(rows).toHaveLength(1);
  });

  it('requires tax.manage to create period', async () => {
    await expect(
      service.createPeriod(user({ roleName: 'VIEWER', permissions: ['tax.read'] }), {
        label: 'P',
        fromDate: '2026-01-01',
        toDate: '2026-02-01',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('submit filing not found', async () => {
    prisma.taxFiling.findFirst.mockResolvedValue(null);
    await expect(
      service.submitFiling(user({ roleName: 'ORG_ADMIN', permissions: [] }), 'f9'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('not found on missing period', async () => {
    prisma.taxPeriod.findFirst.mockResolvedValue(null);
    await expect(
      service.updatePeriod(
        user({ roleName: 'ORG_ADMIN', permissions: [] }),
        'p9',
        { label: 'X' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
