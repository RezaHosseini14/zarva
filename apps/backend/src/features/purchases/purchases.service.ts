import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPurchaseReturnRow, IPurchaseRow, IPurchasesSummary } from '@zarva/shared';
import { businessDateKey } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { GoldLedgerService } from '../gold/gold-ledger.service';
import type { CreatePurchaseDto, CreatePurchaseReturnDto } from './dto/purchases.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldLedger: GoldLedgerService,
  ) {}

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

  async summary(user: IAuthUser): Promise<IPurchasesSummary> {
    this.assertRead(user);
    const orgId = user.organizationId;
    const today = businessDateKey();
    const monthPrefix = today.slice(0, 7);
    const [monthRows, openCount, weightAgg] = await Promise.all([
      this.prisma.purchase.findMany({
        where: {
          organizationId: orgId,
          displayDate: { startsWith: monthPrefix },
        },
        select: { amountIrt: true },
      }),
      this.prisma.purchase.count({
        where: { organizationId: orgId, paymentStatus: { not: 'paid' } },
      }),
      this.prisma.purchase.aggregate({
        where: { organizationId: orgId },
        _sum: { goldWeightGrams: true },
      }),
    ]);
    const monthAmountIrt = monthRows.reduce((s, r) => s + Number(r.amountIrt), 0);
    return {
      monthAmountIrt,
      openCount,
      totalWeightGrams: Number(weightAgg._sum.goldWeightGrams ?? 0),
    };
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

    const purityKarat =
      dto.purityKarat ??
      (dto.purity && Number(dto.purity) > 24
        ? Math.round((Number(dto.purity) / 1000) * 24)
        : Number(dto.purity) || 18);
    const amountIrt =
      dto.amountIrt ??
      (Number(String(dto.amountLabel).replace(/[^\d.]/g, '')) || 0);
    const rateIrt =
      dto.rateIrt ??
      (dto.goldWeightGrams > 0
        ? Math.round(amountIrt / dto.goldWeightGrams)
        : 0);
    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.goldLedger.assertBusinessDayOpen(
      user.organizationId,
      displayDate,
    );

    const r = await this.prisma.$transaction(async (tx) => {
      const created = await tx.purchase.create({
        data: {
          organizationId: user.organizationId,
          supplierId: supplier.id,
          number: dto.number.trim(),
          displayDate,
          goldWeightGrams: dto.goldWeightGrams,
          amountLabel: dto.amountLabel,
          amountIrt,
          purityKarat,
          rateIrt,
          ledgerPostedAt: new Date(),
          lines: {
            create: [
              {
                description: dto.lineDescription ?? 'خرید طلا',
                weight: String(dto.goldWeightGrams),
                purity: String(purityKarat),
                amountLabel: dto.amountLabel,
                weightGrams: dto.goldWeightGrams,
                purityKarat,
              },
            ],
          },
        },
        include: { supplier: true },
      });

      await this.goldLedger.postPurchaseIn(
        user.organizationId,
        created.id,
        [
          {
            grams: dto.goldWeightGrams,
            purityKarat,
            rateIrt,
            counterparty: supplier.name,
          },
        ],
        displayDate,
        tx,
      );

      return created;
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
    if (!purchase.ledgerPostedAt) {
      throw new BadRequestException('Purchase was not posted to ledger');
    }

    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.goldLedger.assertBusinessDayOpen(
      user.organizationId,
      displayDate,
    );

    const purityKarat = dto.purityKarat ?? Number(purchase.purityKarat);
    const grams =
      dto.grams ?? Number(purchase.goldWeightGrams);
    const purchaseGrams = Number(purchase.goldWeightGrams);
    const isFull = grams >= purchaseGrams - 0.0005;

    const r = await this.prisma.$transaction(async (tx) => {
      const created = await tx.purchaseReturn.create({
        data: {
          organizationId: user.organizationId,
          purchaseId: purchase.id,
          number: dto.number.trim(),
          displayDate,
          amountLabel: dto.amountLabel,
          grams,
          purityKarat,
        },
        include: { purchase: true },
      });
      if (isFull) {
        await this.goldLedger.reverseBySource(
          user.organizationId,
          'purchase',
          purchase.id,
          tx,
        );
      } else {
        await this.goldLedger.reverseBySourcePartial(
          user.organizationId,
          'purchase',
          purchase.id,
          [{ purityKarat, grams }],
          tx,
        );
      }
      return created;
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
