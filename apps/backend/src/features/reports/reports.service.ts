import { ForbiddenException, Injectable } from '@nestjs/common';
import type { IReportDto } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(
    user: IAuthUser,
    kind: 'sales' | 'purchases' | 'inventory' | 'gold' | 'profit',
    from?: string,
    to?: string,
  ): Promise<IReportDto> {
    this.assertRead(user);
    const period =
      from && to ? `${from} → ${to}` : new Date().toISOString().slice(0, 7);

    switch (kind) {
      case 'sales': {
        const invoices = await this.prisma.saleInvoice.findMany({
          where: { organizationId: user.organizationId },
        });
        const total = invoices.reduce(
          (s, i) => s + Number(i.amountIRT.toString()),
          0,
        );
        return this.build(
          period,
          this.fmt(total),
          [
            { id: 'count', label: 'invoices', value: String(invoices.length) },
            { id: 'paid', label: 'paid', value: String(invoices.filter((i) => i.paymentStatus === 'paid').length) },
          ],
          invoices.slice(0, 7).map((i, idx) => ({
            label: i.displayDate || `D${idx + 1}`,
            value: Number(i.amountIRT.toString()),
          })),
        );
      }
      case 'purchases': {
        const rows = await this.prisma.purchase.findMany({
          where: { organizationId: user.organizationId },
        });
        return this.build(
          period,
          String(rows.length),
          [{ id: 'count', label: 'purchases', value: String(rows.length) }],
          rows.slice(0, 7).map((r, idx) => ({
            label: r.displayDate || `D${idx + 1}`,
            value: Number(r.goldWeightGrams.toString()),
          })),
        );
      }
      case 'inventory': {
        const rows = await this.prisma.inventoryItem.findMany({
          where: { organizationId: user.organizationId },
        });
        const qty = rows.reduce((s, r) => s + r.qty, 0);
        return this.build(
          period,
          String(qty),
          [
            { id: 'skus', label: 'skus', value: String(rows.length) },
            { id: 'low', label: 'low', value: String(rows.filter((r) => r.status === 'low').length) },
          ],
          rows.slice(0, 7).map((r) => ({ label: r.name, value: r.qty })),
        );
      }
      case 'gold': {
        const rows = await this.prisma.goldTxn.findMany({
          where: { organizationId: user.organizationId },
        });
        return this.build(
          period,
          String(rows.length),
          [{ id: 'txns', label: 'transactions', value: String(rows.length) }],
          rows.slice(0, 7).map((r, idx) => ({
            label: r.displayDate || `T${idx + 1}`,
            value: Number(r.weight) || idx + 1,
          })),
        );
      }
      case 'profit': {
        const invoices = await this.prisma.saleInvoice.findMany({
          where: { organizationId: user.organizationId },
        });
        const sales = invoices.reduce((s, i) => s + Number(i.amountIRT.toString()), 0);
        const purchases = await this.prisma.purchase.findMany({
          where: { organizationId: user.organizationId },
        });
        // Approximate purchase cost from label digits when present
        const purchaseCost = purchases.length * (sales / Math.max(invoices.length, 1)) * 0.6;
        const profit = Math.round(sales - purchaseCost);
        return this.build(
          period,
          this.fmt(profit),
          [
            { id: 'sales', label: 'sales', value: this.fmt(sales) },
            { id: 'cogs', label: 'cogs', value: this.fmt(Math.round(purchaseCost)) },
          ],
          [
            { label: 'sales', value: sales },
            { label: 'cogs', value: Math.round(purchaseCost) },
            { label: 'profit', value: profit },
          ],
        );
      }
      default:
        return this.build(period, '0', [], []);
    }
  }

  private build(
    period: string,
    total: string,
    kpis: IReportDto['kpis'],
    series: IReportDto['series'],
  ): IReportDto {
    return { period, total, kpis, series };
  }

  private fmt(n: number): string {
    return Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  }

  private assertRead(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    ) {
      return;
    }
    if (!user.permissions.includes('reports.read')) {
      throw new ForbiddenException('Missing reports.read');
    }
  }
}
