import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ITaxExportResult,
  ITaxFilingRow,
  ITaxPeriodRow,
  TaxFilingKind,
} from '@zarva/shared';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { CreateTaxPeriodDto, GenerateTaxFilingDto, UpdateTaxPeriodDto } from './dto/tax.dto';
import { TaxAuthorityAdapter } from './tax.authority.adapter';
import { exportTaxFilingCsv, exportTaxFilingXml } from './tax.export.file-adapter';

const COUNTABLE_STATUSES = ['confirmed', 'completed', 'ready'] as const;

@Injectable()
export class TaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authority: TaxAuthorityAdapter,
  ) {}

  async listPeriods(user: IAuthUser): Promise<ITaxPeriodRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.taxPeriod.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { fromDate: 'desc' },
    });
    return rows.map((r) => this.mapPeriod(r));
  }

  async createPeriod(user: IAuthUser, dto: CreateTaxPeriodDto): Promise<ITaxPeriodRow> {
    this.assertWrite(user);
    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);
    if (toDate <= fromDate) {
      throw new BadRequestException('toDate must be after fromDate');
    }
    const r = await this.prisma.taxPeriod.create({
      data: {
        organizationId: user.organizationId,
        label: dto.label,
        fromDate,
        toDate,
      },
    });
    return this.mapPeriod(r);
  }

  async updatePeriod(
    user: IAuthUser,
    id: string,
    dto: UpdateTaxPeriodDto,
  ): Promise<ITaxPeriodRow> {
    this.assertWrite(user);
    await this.findOrgPeriod(user.organizationId, id);
    const r = await this.prisma.taxPeriod.update({
      where: { id },
      data: { label: dto.label },
    });
    return this.mapPeriod(r);
  }

  async closePeriod(user: IAuthUser, id: string): Promise<ITaxPeriodRow> {
    this.assertWrite(user);
    await this.findOrgPeriod(user.organizationId, id);
    const r = await this.prisma.taxPeriod.update({
      where: { id },
      data: { status: 'closed' },
    });
    return this.mapPeriod(r);
  }

  async generateFiling(
    user: IAuthUser,
    periodId: string,
    dto: GenerateTaxFilingDto,
  ): Promise<ITaxFilingRow> {
    this.assertWrite(user);
    const period = await this.findOrgPeriod(user.organizationId, periodId);
    const kind: TaxFilingKind = dto.kind ?? 'vat';

    const invoices = await this.prisma.saleInvoice.findMany({
      where: {
        organizationId: user.organizationId,
        status: { in: [...COUNTABLE_STATUSES] },
        createdAt: { gte: period.fromDate, lte: period.toDate },
      },
      select: {
        number: true,
        amountIRT: true,
        goldWeightGrams: true,
        status: true,
      },
    });

    let totalIrt = new Prisma.Decimal(0);
    let totalGold = new Prisma.Decimal(0);
    for (const inv of invoices) {
      totalIrt = totalIrt.add(inv.amountIRT);
      totalGold = totalGold.add(inv.goldWeightGrams);
    }

    const totals = {
      invoiceCount: invoices.length,
      totalAmountIRT: totalIrt.toString(),
      totalGoldWeightGrams: totalGold.toString(),
    };

    const filing = await this.prisma.taxFiling.create({
      data: {
        periodId: period.id,
        kind,
        status: 'ready',
        totals: totals as Prisma.InputJsonValue,
        lines: {
          create: invoices.map((inv) => ({
            label: inv.number,
            amount: inv.amountIRT.toString(),
            meta: {
              status: inv.status,
              goldWeightGrams: inv.goldWeightGrams.toString(),
            } as Prisma.InputJsonValue,
          })),
        },
      },
      include: { lines: true },
    });

    return this.mapFiling(filing, period.label);
  }

  async listFilings(user: IAuthUser): Promise<ITaxFilingRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.taxFiling.findMany({
      where: { period: { organizationId: user.organizationId } },
      include: { period: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapFiling(r, r.period.label));
  }

  async exportFiling(
    user: IAuthUser,
    filingId: string,
    format: 'xml' | 'csv',
  ): Promise<ITaxExportResult> {
    this.assertRead(user);
    const filing = await this.prisma.taxFiling.findFirst({
      where: { id: filingId, period: { organizationId: user.organizationId } },
      include: { period: true, lines: true },
    });
    if (!filing) {
      throw new NotFoundException('Filing not found');
    }
    const totals = filing.totals as Record<string, number | string>;
    const input = {
      filingId: filing.id,
      periodLabel: filing.period.label,
      kind: filing.kind,
      totals,
      lines: filing.lines.map((l) => ({ label: l.label, amount: l.amount })),
    };
    const result = format === 'xml' ? exportTaxFilingXml(input) : exportTaxFilingCsv(input);
    await this.prisma.taxFiling.update({
      where: { id: filing.id },
      data: {
        status: 'exported',
        exportedAt: new Date(),
        artifact: result.content.slice(0, 500),
      },
    });
    return result;
  }

  async submitFiling(user: IAuthUser, filingId: string): Promise<ITaxFilingRow> {
    this.assertWrite(user);
    const filing = await this.prisma.taxFiling.findFirst({
      where: { id: filingId, period: { organizationId: user.organizationId } },
      include: { period: true },
    });
    if (!filing) {
      throw new NotFoundException('Filing not found');
    }
    const submitResult = await this.authority.submit({
      filingId: filing.id,
      artifact: filing.artifact,
    });
    const updated = await this.prisma.taxFiling.update({
      where: { id: filing.id },
      data: {
        status: 'submitted',
        totals: {
          ...(filing.totals as object),
          authorityReference: submitResult.reference,
        } as Prisma.InputJsonValue,
      },
    });
    return this.mapFiling(updated, filing.period.label);
  }

  private async findOrgPeriod(organizationId: string, id: string) {
    const row = await this.prisma.taxPeriod.findFirst({
      where: { id, organizationId },
    });
    if (!row) {
      throw new NotFoundException('Tax period not found');
    }
    return row;
  }

  private mapPeriod(r: {
    id: string;
    label: string;
    fromDate: Date;
    toDate: Date;
    status: 'open' | 'closed';
  }): ITaxPeriodRow {
    return {
      id: r.id,
      a: r.label,
      b: r.fromDate.toISOString().slice(0, 10),
      c: r.toDate.toISOString().slice(0, 10),
      from: r.fromDate.toISOString(),
      to: r.toDate.toISOString(),
      status: r.status,
    };
  }

  private mapFiling(
    r: {
      id: string;
      periodId: string;
      kind: TaxFilingKind;
      status: 'draft' | 'ready' | 'exported' | 'submitted';
      totals: unknown;
    },
    periodLabel: string,
  ): ITaxFilingRow {
    const totals = (r.totals ?? {}) as Record<string, number | string>;
    return {
      id: r.id,
      a: periodLabel,
      b: r.kind,
      c: r.status,
      periodId: r.periodId,
      kind: r.kind,
      status: r.status,
      totals,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('tax.read')) {
      throw new ForbiddenException('Missing tax.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('tax.manage')) {
      throw new ForbiddenException('Missing tax.manage');
    }
  }

  private isAdmin(user: IAuthUser): boolean {
    return (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    );
  }
}
