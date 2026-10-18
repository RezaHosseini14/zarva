import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IDayCloseSummary, IReportDto, IReportSeriesPoint } from '@zarva/shared';
import { businessDateKey, fineGramsFromKarat } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { GoldLedgerService } from '../gold/gold-ledger.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldLedger: GoldLedgerService,
  ) {}

  async getDayClose(
    user: IAuthUser,
    date?: string,
    signOff = false,
  ): Promise<IDayCloseSummary> {
    this.assertRead(user);
    const businessDate = businessDateKey(date || businessDateKey());
    const orgId = user.organizationId;

    const existing = await this.prisma.dayClose.findUnique({
      where: {
        organizationId_businessDate: {
          organizationId: orgId,
          businessDate: new Date(businessDate),
        },
      },
    });

    if (existing && !existing.reopenedAt && !signOff) {
      return this.parseFrozenSummary(existing.summaryJson, existing.closedAt);
    }

    if (signOff && existing && !existing.reopenedAt) {
      return this.parseFrozenSummary(existing.summaryJson, existing.closedAt);
    }

    const summary = await this.computeDayClose(orgId, businessDate);

    if (signOff) {
      this.assertWrite(user);
      if (existing?.reopenedAt) {
        const row = await this.prisma.dayClose.update({
          where: { id: existing.id },
          data: {
            summaryJson: summary as object,
            closedAt: new Date(),
            closedByUserId: user.id,
            reopenedAt: null,
            reopenReason: null,
          },
        });
        return { ...summary, closedAt: row.closedAt.toISOString() };
      }
      const row = await this.prisma.dayClose.create({
        data: {
          organizationId: orgId,
          businessDate: new Date(businessDate),
          summaryJson: summary as object,
          closedByUserId: user.id,
        },
      });
      return { ...summary, closedAt: row.closedAt.toISOString() };
    }

    return {
      ...summary,
      closedAt: existing && !existing.reopenedAt
        ? existing.closedAt.toISOString()
        : null,
    };
  }

  async reopenDayClose(
    user: IAuthUser,
    date: string | undefined,
    reason: string,
  ): Promise<IDayCloseSummary> {
    this.assertWrite(user);
    if (!reason.trim() || reason.trim().length < 3) {
      throw new ConflictException('Reopen reason is required');
    }
    const businessDate = businessDateKey(date || businessDateKey());
    const existing = await this.prisma.dayClose.findUnique({
      where: {
        organizationId_businessDate: {
          organizationId: user.organizationId,
          businessDate: new Date(businessDate),
        },
      },
    });
    if (!existing || existing.reopenedAt) {
      throw new NotFoundException('No closed day to reopen');
    }

    const summary = this.parseFrozenSummary(
      existing.summaryJson,
      existing.closedAt,
    );
    await this.prisma.dayClose.update({
      where: { id: existing.id },
      data: {
        reopenedAt: new Date(),
        reopenReason: reason.trim(),
        summaryJson: {
          ...summary,
          reopenReason: reason.trim(),
        } as object,
      },
    });

    return this.computeDayClose(user.organizationId, businessDate).then((s) => ({
      ...s,
      closedAt: null,
    }));
  }

  private async computeDayClose(
    orgId: string,
    businessDate: string,
  ): Promise<IDayCloseSummary> {
    const [sales, buybacks, purchases, payments, txns, stockAsOf] =
      await Promise.all([
        this.prisma.saleInvoice.findMany({
          where: {
            organizationId: orgId,
            documentKind: 'sale',
            status: { in: ['confirmed', 'ready', 'completed'] },
            displayDate: businessDate,
          },
        }),
        this.prisma.saleInvoice.findMany({
          where: {
            organizationId: orgId,
            documentKind: 'buyback',
            status: { in: ['confirmed', 'ready', 'completed'] },
            displayDate: businessDate,
          },
        }),
        this.prisma.purchase.findMany({
          where: { organizationId: orgId, displayDate: businessDate },
        }),
        this.prisma.salePayment.findMany({
          where: { organizationId: orgId, displayDate: businessDate },
          include: { invoice: true },
        }),
        this.prisma.goldTxn.findMany({
          where: {
            organizationId: orgId,
            displayDate: businessDate,
          },
        }),
        this.goldLedger.stockAsOf(orgId, businessDate),
      ]);

    const metalMap = new Map<
      number,
      { gramsIn: number; gramsOut: number }
    >();
    for (const t of txns) {
      const karat = Number(t.purityKarat);
      const cur = metalMap.get(karat) ?? { gramsIn: 0, gramsOut: 0 };
      const g = Number(t.grams);
      if (t.direction === 'in') cur.gramsIn += g;
      else cur.gramsOut += g;
      metalMap.set(karat, cur);
    }
    const stockByKarat = new Map(stockAsOf.map((s) => [s.purityKarat, s.grams]));

    const karatKeys = new Set([
      ...metalMap.keys(),
      ...stockByKarat.keys(),
    ]);
    const metal = [...karatKeys]
      .map((purityKarat) => {
        const v = metalMap.get(purityKarat) ?? { gramsIn: 0, gramsOut: 0 };
        return {
          purityKarat,
          gramsIn: Math.round(v.gramsIn * 1000) / 1000,
          gramsOut: Math.round(v.gramsOut * 1000) / 1000,
          closingGrams: stockByKarat.get(purityKarat) ?? 0,
        };
      })
      .sort((a, b) => a.purityKarat - b.purityKarat);

    const salesAmountIrt = sales.reduce((s, i) => s + Number(i.amountIRT), 0);
    const buybacksAmountIrt = buybacks.reduce(
      (s, i) => s + Number(i.amountIRT),
      0,
    );
    const purchasesAmountIrt = purchases.reduce(
      (s, i) => s + Number(i.amountIrt || 0),
      0,
    );

    let cashInIrt = 0;
    let cashOutIrt = 0;
    for (const p of payments) {
      const amt = Number(p.amountIrt || 0);
      if (p.invoice.documentKind === 'buyback') cashOutIrt += amt;
      else cashInIrt += amt;
    }
    cashOutIrt += purchasesAmountIrt;

    return {
      businessDate,
      salesCount: sales.length,
      buybacksCount: buybacks.length,
      purchasesCount: purchases.length,
      salesAmountIrt,
      buybacksAmountIrt,
      purchasesAmountIrt,
      cashInIrt,
      cashOutIrt,
      metal,
      closedAt: null,
    };
  }

  private parseFrozenSummary(
    json: unknown,
    closedAt: Date,
  ): IDayCloseSummary {
    const s = json as IDayCloseSummary;
    return {
      ...s,
      closedAt: closedAt.toISOString(),
    };
  }

  async getReport(
    user: IAuthUser,
    kind: 'sales' | 'purchases' | 'inventory' | 'gold' | 'profit',
    from?: string,
    to?: string,
  ): Promise<IReportDto> {
    this.assertRead(user);
    const orgId = user.organizationId;
    const fromKey = from ? businessDateKey(from) : undefined;
    const toKey = to ? businessDateKey(to) : undefined;

    if (kind === 'sales') {
      const rows = await this.prisma.saleInvoice.findMany({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { in: ['confirmed', 'ready', 'completed'] },
          ...(fromKey || toKey
            ? {
                displayDate: {
                  ...(fromKey ? { gte: fromKey } : {}),
                  ...(toKey ? { lte: toKey } : {}),
                },
              }
            : {}),
        },
      });
      const total = rows.reduce((s, r) => s + Number(r.amountIRT), 0);
      return {
        period: `${fromKey ?? '…'} → ${toKey ?? '…'}`,
        total: String(total),
        kpis: [
          { id: 'count', label: 'count', value: String(rows.length) },
          { id: 'amount', label: 'amount', value: String(total) },
        ],
        series: await this.dailySeries(orgId, 'sales'),
      };
    }

    if (kind === 'purchases') {
      const rows = await this.prisma.purchase.findMany({
        where: {
          organizationId: orgId,
          ...(fromKey || toKey
            ? {
                displayDate: {
                  ...(fromKey ? { gte: fromKey } : {}),
                  ...(toKey ? { lte: toKey } : {}),
                },
              }
            : {}),
        },
      });
      const total = rows.reduce((s, r) => s + Number(r.amountIrt || 0), 0);
      return {
        period: `${fromKey ?? '…'} → ${toKey ?? '…'}`,
        total: String(total),
        kpis: [
          { id: 'count', label: 'count', value: String(rows.length) },
          { id: 'amount', label: 'amount', value: String(total) },
        ],
        series: await this.dailySeries(orgId, 'purchases'),
      };
    }

    if (kind === 'gold') {
      const stock = await this.goldLedger.listStockByKarat(orgId);
      const grams = stock.reduce((s, r) => s + r.grams, 0);
      return {
        period: businessDateKey(),
        total: String(grams),
        kpis: stock.map((r) => ({
          id: `${r.purityKarat}k`,
          label: `${r.purityKarat}k`,
          value: String(r.grams),
        })),
        series: await this.dailySeries(orgId, 'gold'),
      };
    }

    if (kind === 'inventory') {
      const count = await this.prisma.inventoryItem.count({
        where: { organizationId: orgId },
      });
      return {
        period: businessDateKey(),
        total: String(count),
        kpis: [{ id: 'items', label: 'items', value: String(count) }],
        series: [],
      };
    }

    return this.profitReport(orgId);
  }

  private async profitReport(orgId: string): Promise<IReportDto> {
    const sales = await this.prisma.saleInvoice.findMany({
      where: {
        organizationId: orgId,
        documentKind: 'sale',
        status: { in: ['confirmed', 'ready', 'completed'] },
      },
      include: { lines: true },
    });
    const salesAmt = sales.reduce((s, r) => s + Number(r.amountIRT), 0);

    let cogs = 0;
    for (const inv of sales) {
      const rate = await this.goldLedger.tryGetLockedRate(orgId, inv.displayDate);
      const buyRate = rate?.buyRateIrt ?? 0;
      for (const line of inv.lines) {
        const fine = fineGramsFromKarat(Number(line.weightGrams), Number(line.purityKarat));
        const lineRate =
          buyRate > 0
            ? buyRate
            : Number(line.rateIrt) > 0
              ? Number(line.rateIrt)
              : 0;
        cogs += fine * lineRate;
      }
    }
    cogs = Math.round(cogs);
    const profit = Math.round(salesAmt - cogs);
    return {
      period: businessDateKey(),
      total: String(profit),
      kpis: [
        { id: 'sales', label: 'sales', value: String(salesAmt) },
        { id: 'cogs', label: 'cogs', value: String(cogs) },
        { id: 'profit', label: 'profit', value: String(profit) },
      ],
      series: await this.dailySeries(orgId, 'sales'),
    };
  }

  private last7TehranKeys(): string[] {
    const keys: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 86_400_000);
      keys.push(businessDateKey(d));
    }
    return keys;
  }

  private async dailySeries(
    orgId: string,
    kind: 'sales' | 'purchases' | 'gold',
  ): Promise<IReportSeriesPoint[]> {
    const keys = this.last7TehranKeys();
    if (kind === 'sales') {
      const rows = await this.prisma.saleInvoice.findMany({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { in: ['confirmed', 'ready', 'completed'] },
          displayDate: { in: keys },
        },
        select: { displayDate: true, amountIRT: true },
      });
      return keys.map((label) => ({
        label,
        value: rows
          .filter((r) => r.displayDate === label)
          .reduce((s, r) => s + Number(r.amountIRT), 0),
      }));
    }
    if (kind === 'purchases') {
      const rows = await this.prisma.purchase.findMany({
        where: { organizationId: orgId, displayDate: { in: keys } },
        select: { displayDate: true, amountIrt: true },
      });
      return keys.map((label) => ({
        label,
        value: rows
          .filter((r) => r.displayDate === label)
          .reduce((s, r) => s + Number(r.amountIrt), 0),
      }));
    }
    const rows = await this.prisma.goldTxn.findMany({
      where: { organizationId: orgId, displayDate: { in: keys } },
      select: { displayDate: true, grams: true, direction: true },
    });
    return keys.map((label) => ({
      label,
      value: rows
        .filter((r) => r.displayDate === label)
        .reduce(
          (s, r) => s + (r.direction === 'out' ? -Number(r.grams) : Number(r.grams)),
          0,
        ),
    }));
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('reports.read')) {
      throw new ForbiddenException('Missing reports.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      !user.permissions.includes('reports.create') &&
      !user.permissions.includes('reports.update')
    ) {
      throw new ForbiddenException('Missing reports write');
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
