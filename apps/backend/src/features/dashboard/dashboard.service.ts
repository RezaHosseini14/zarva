import { Injectable } from '@nestjs/common';
import type { IDashboardInsight, IDashboardOverview } from '@zarva/shared';
import { businessDateKey } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { GoldLedgerService } from '../gold/gold-ledger.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldLedger: GoldLedgerService,
  ) {}

  async overview(user: IAuthUser): Promise<IDashboardOverview> {
    const today = businessDateKey();
    const orgId = user.organizationId;

    const [
      salesToday,
      customersCount,
      stockGrams,
      recentSales,
      recentPurchases,
      recentTxns,
      paymentsToday,
      last7,
    ] = await Promise.all([
      this.prisma.saleInvoice.findMany({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { in: ['confirmed', 'ready', 'completed'] },
          OR: [
            { displayDate: today },
            {
              displayDate: '',
              createdAt: {
                gte: new Date(`${today}T00:00:00.000Z`),
                lt: new Date(`${today}T23:59:59.999Z`),
              },
            },
          ],
        },
      }),
      this.prisma.customer.count({ where: { organizationId: orgId } }),
      this.goldLedger.sumStockGrams(orgId),
      this.prisma.saleInvoice.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { customer: true },
      }),
      this.prisma.purchase.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 2,
      }),
      this.prisma.goldTxn.findMany({
        where: { organizationId: orgId, sourceType: 'adjust' },
        orderBy: { createdAt: 'desc' },
        take: 2,
      }),
      this.prisma.salePayment.findMany({
        where: {
          organizationId: orgId,
          displayDate: today,
          invoice: { documentKind: 'sale' },
        },
      }),
      this.salesLast7Days(orgId),
    ]);

    const salesAmount = salesToday.reduce((s, i) => s + Number(i.amountIRT), 0);
    const salesMillion = Math.round((salesAmount / 1_000_000) * 10) / 10;
    const stockKg = Math.round((stockGrams / 1000) * 10) / 10;
    const cashInIrt = paymentsToday.reduce((s, p) => s + Number(p.amountIrt || 0), 0);
    const cashInMillion = Math.round((cashInIrt / 1_000_000) * 10) / 10;

    const activity: Array<{
      id: string;
      titleKey: string;
      time: string;
    }> = [];
    for (const s of recentSales) {
      activity.push({
        id: `sale-${s.id}`,
        titleKey:
          s.documentKind === 'buyback'
            ? 'dashboard.activity.buybackCompleted'
            : 'dashboard.activity.saleCompleted',
        time: this.relTime(s.createdAt),
      });
    }
    for (const p of recentPurchases) {
      activity.push({
        id: `pur-${p.id}`,
        titleKey: 'dashboard.activity.purchaseReceived',
        time: this.relTime(p.createdAt),
      });
    }
    for (const t of recentTxns) {
      activity.push({
        id: `txn-${t.id}`,
        titleKey: 'dashboard.activity.stockAdjust',
        time: this.relTime(t.createdAt),
      });
    }

    return {
      kpis: [
        {
          id: 'sales-today',
          labelKey: 'dashboard.kpi.salesToday',
          value: salesMillion,
          unit: 'million',
          delta: salesToday.length,
          deltaUnit: 'count',
          trend: salesToday.length > 0 ? 'up' : 'flat',
        },
        {
          id: 'gold-stock',
          labelKey: 'dashboard.kpi.goldStock',
          value: stockKg,
          unit: 'kg',
          delta: Math.round(stockGrams),
          deltaUnit: 'count',
          trend: stockGrams > 0 ? 'up' : 'flat',
        },
        {
          id: 'customers',
          labelKey: 'dashboard.kpi.customers',
          value: customersCount,
          unit: 'count',
          delta: 0,
          deltaUnit: 'count',
          trend: 'flat',
        },
        {
          id: 'cash-in-today',
          labelKey: 'dashboard.kpi.cashInToday',
          value: cashInMillion,
          unit: 'million',
          delta: paymentsToday.length,
          deltaUnit: 'count',
          trend: cashInIrt > 0 ? 'up' : 'flat',
        },
      ],
      forecast: last7,
      activity: activity.slice(0, 8),
    };
  }

  private async salesLast7Days(
    organizationId: string,
  ): Promise<Array<{ label: string; value: number }>> {
    const keys: string[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      keys.push(businessDateKey(d));
    }

    const rows = await this.prisma.saleInvoice.findMany({
      where: {
        organizationId,
        documentKind: 'sale',
        status: { not: 'void' },
        displayDate: { in: keys },
      },
      select: { displayDate: true, amountIRT: true },
    });

    const totals = new Map<string, number>();
    for (const key of keys) totals.set(key, 0);
    for (const row of rows) {
      totals.set(
        row.displayDate,
        (totals.get(row.displayDate) ?? 0) + Number(row.amountIRT),
      );
    }

    return keys.map((key) => ({
      label: key.slice(5),
      value: Math.round((totals.get(key) ?? 0) / 1_000_000),
    }));
  }

  async insights(user: IAuthUser): Promise<ReadonlyArray<IDashboardInsight>> {
    const orgId = user.organizationId;
    const today = businessDateKey();
    const [lowStock, unlockedRate, unpaid, dbInsights] = await Promise.all([
      this.prisma.inventoryItem.count({
        where: {
          organizationId: orgId,
          OR: [{ status: 'low' }, { qty: { lte: 2 } }],
        },
      }),
      this.goldLedger.tryGetLockedRate(orgId, today),
      this.prisma.saleInvoice.count({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
          paymentStatus: { not: 'paid' },
        },
      }),
      this.prisma.aiInsight.findMany({
        where: { organizationId: orgId, dismissedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const items: IDashboardInsight[] = [];
    if (!unlockedRate) {
      items.push({
        id: 'rate-unlocked',
        title: 'Daily gold rate unlocked',
        body: 'Lock today’s buy/sell rates before selling or purchasing metal.',
        severity: 'warning',
      });
    }
    if (lowStock > 0) {
      items.push({
        id: 'low-stock',
        title: 'Low stock items',
        body: `${lowStock} SKU(s) are at or below the low-stock threshold.`,
        severity: lowStock > 5 ? 'critical' : 'warning',
      });
    }
    if (unpaid > 0) {
      items.push({
        id: 'unpaid-invoices',
        title: 'Open receivables',
        body: `${unpaid} sale invoice(s) still have an unpaid balance.`,
        severity: 'info',
      });
    }
    for (const row of dbInsights) {
      items.push({
        id: row.id,
        title: row.title,
        body: row.body,
        severity: row.severity as 'info' | 'warning' | 'critical',
      });
    }
    if (items.length === 0) {
      items.push({
        id: 'all-clear',
        title: 'No alerts',
        body: 'Stock, rates, and receivables look clear for today.',
        severity: 'info',
      });
    }
    return items.slice(0, 8);
  }

  private relTime(date: Date): string {
    const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (mins < 60) return `${mins}m`;
    const hours = Math.round(mins / 60);
    if (hours < 48) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  }
}
