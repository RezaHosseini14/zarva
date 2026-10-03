import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { IPurchaseReturnRow, IPurchaseRow } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { CreatePurchaseDto, CreatePurchaseReturnDto } from './dto/purchases.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: IAuthUser): Promise<IPurchaseRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.purchase.findMany({
      where: { organizationId: user.organizationId },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      supplier: r.supplier.name,
      date: r.displayDate,
      goldWeight: r.goldWeightGrams.toString(),
      amount: r.amountLabel,
      paymentStatus: r.paymentStatus,
    }));
  }

  async get(user: IAuthUser, id: string): Promise<IPurchaseRow> {
    this.assertRead(user);
    const r = await this.prisma.purchase.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { supplier: true },
    });
    if (!r) throw new NotFoundException('Purchase not found');
    return {
      id: r.id,
      number: r.number,
      supplier: r.supplier.name,
      date: r.displayDate,
      goldWeight: r.goldWeightGrams.toString(),
      amount: r.amountLabel,
      paymentStatus: r.paymentStatus,
    };
  }

  async create(user: IAuthUser, dto: CreatePurchaseDto): Promise<IPurchaseRow> {
    this.assertWrite(user);
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, organizationId: user.organizationId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const r = await this.prisma.purchase.create({
      data: {
        organizationId: user.organizationId,
        supplierId: supplier.id,
        number: dto.number.trim(),
        displayDate: dto.displayDate,
        goldWeightGrams: dto.goldWeightGrams,
        amountLabel: dto.amountLabel,
        lines: {
          create: [
            {
              description: dto.lineDescription ?? 'خرید طلا',
              weight: String(dto.goldWeightGrams),
              purity: dto.purity ?? '750',
              amountLabel: dto.amountLabel,
            },
          ],
        },
      },
      include: { supplier: true },
    });
    return {
      id: r.id,
      number: r.number,
      supplier: r.supplier.name,
      date: r.displayDate,
      goldWeight: r.goldWeightGrams.toString(),
      amount: r.amountLabel,
      paymentStatus: r.paymentStatus,
    };
  }

  async listReturns(user: IAuthUser): Promise<IPurchaseReturnRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.purchaseReturn.findMany({
      where: { organizationId: user.organizationId },
      include: { purchase: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      purchase: r.purchase.number,
      date: r.displayDate,
      amount: r.amountLabel,
    }));
  }

  async createReturn(user: IAuthUser, dto: CreatePurchaseReturnDto): Promise<IPurchaseReturnRow> {
    this.assertWrite(user);
    const purchase = await this.prisma.purchase.findFirst({
      where: { id: dto.purchaseId, organizationId: user.organizationId },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');
    const r = await this.prisma.purchaseReturn.create({
      data: {
        organizationId: user.organizationId,
        purchaseId: purchase.id,
        number: dto.number.trim(),
        displayDate: dto.displayDate,
        amountLabel: dto.amountLabel,
      },
      include: { purchase: true },
    });
    return {
      id: r.id,
      number: r.number,
      purchase: r.purchase.number,
      date: r.displayDate,
      amount: r.amountLabel,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('purchases.read')) {
      throw new ForbiddenException('Missing purchases.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      !user.permissions.includes('purchases.create') &&
      !user.permissions.includes('purchases.update')
    ) {
      throw new ForbiddenException('Missing purchases write');
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
