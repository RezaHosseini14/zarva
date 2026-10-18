import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IGoldBalanceRow,
  IGoldCalculatorResult,
  IGoldLedgerEntry,
  IGoldLockedRate,
  IGoldLotRow,
  IGoldPurityRow,
  IGoldRateBoardRow,
  IGoldSummary,
  IGoldTxnRow,
  ILockGoldRateRequest,
} from '@zarva/shared';
import { businessDateKey } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type {
  CorrectGoldRateDto,
  CreateGoldLotDto,
  CreateGoldPurityDto,
  CreateGoldTxnDto,
  GoldCalculatorDto,
  LockGoldRateDto,
} from './dto/gold.dto';
import { GoldLedgerService } from './gold-ledger.service';

@Injectable()
export class GoldService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: GoldLedgerService,
  ) {}

  async listTxns(user: IAuthUser): Promise<IGoldTxnRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldTxn.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      date: r.displayDate,
      type: r.typeLabel,
      weight: r.weight,
      purity: r.purity,
      fineGold: r.fineGold,
      counterparty: r.counterparty,
      reference: r.reference,
    }));
  }

  async listLedger(user: IAuthUser): Promise<IGoldLedgerEntry[]> {
    this.assertRead(user);
    return this.ledger.listLedgerEntries(user.organizationId);
  }

  async summary(user: IAuthUser): Promise<IGoldSummary> {
    this.assertRead(user);
    const [stockGrams, txnCount, locked] = await Promise.all([
      this.ledger.sumStockGrams(user.organizationId),
      this.prisma.goldTxn.count({ where: { organizationId: user.organizationId } }),
      this.ledger.tryGetLockedRate(user.organizationId, businessDateKey()),
    ]);
    return {
      stockGrams: Math.round(stockGrams * 1000) / 1000,
      txnCount,
      lockedRateToday: locked != null,
    };
  }

  async createTxn(user: IAuthUser, dto: CreateGoldTxnDto): Promise<IGoldTxnRow> {
    this.assertWrite(user);
    await this.ledger.postAdjust(user.organizationId, {
      grams: dto.grams,
      purityKarat: dto.purityKarat,
      direction: dto.direction,
      reason: dto.reason,
      displayDate: dto.displayDate,
      rateIrt: dto.rateIrt,
    });
    const r = await this.prisma.goldTxn.findFirst({
      where: { organizationId: user.organizationId, sourceType: 'adjust' },
      orderBy: { createdAt: 'desc' },
    });
    if (!r) {
      throw new NotFoundException('Adjust transaction not found');
    }
    return {
      id: r.id,
      date: r.displayDate,
      type: r.typeLabel,
      weight: r.weight,
      purity: r.purity,
      fineGold: r.fineGold,
      counterparty: r.counterparty,
      reference: r.reference,
    };
  }

  async lockRate(user: IAuthUser, dto: LockGoldRateDto): Promise<IGoldLockedRate> {
    this.assertWrite(user);
    const body: ILockGoldRateRequest = {
      businessDate: dto.businessDate,
      buyRateIrt: dto.buyRateIrt,
      sellRateIrt: dto.sellRateIrt,
      label: dto.label,
    };
    return this.ledger.lockRate(user.organizationId, body);
  }

  async correctRate(
    user: IAuthUser,
    dto: CorrectGoldRateDto,
  ): Promise<IGoldLockedRate> {
    this.assertWrite(user);
    return this.ledger.correctRate(user.organizationId, user.id, {
      businessDate: dto.businessDate,
      buyRateIrt: dto.buyRateIrt,
      sellRateIrt: dto.sellRateIrt,
      reason: dto.reason,
    });
  }

  async todayRate(
    user: IAuthUser,
    date?: string,
  ): Promise<IGoldLockedRate | null> {
    this.assertRead(user);
    return this.ledger.tryGetLockedRate(
      user.organizationId,
      date ? businessDateKey(date) : businessDateKey(),
    );
  }

  async listPurities(user: IAuthUser): Promise<IGoldPurityRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldPurity.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.name,
      b: r.karat,
      c: r.ratioLabel,
    }));
  }

  async createPurity(user: IAuthUser, dto: CreateGoldPurityDto): Promise<IGoldPurityRow> {
    this.assertWrite(user);
    const r = await this.prisma.goldPurity.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        karat: dto.karat,
        ratioLabel: dto.ratioLabel,
      },
    });
    return { id: r.id, a: r.name, b: r.karat, c: r.ratioLabel };
  }

  async listLots(user: IAuthUser): Promise<IGoldLotRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldLot.findMany({
      where: { organizationId: user.organizationId },
      include: { purity: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.code,
      b: r.weightLabel,
      c: r.purity?.name ?? r.statusLabel,
    }));
  }

  async createLot(user: IAuthUser, dto: CreateGoldLotDto): Promise<IGoldLotRow> {
    this.assertWrite(user);
    let purityKarat = dto.purityKarat ?? 18;
    if (dto.purityId) {
      const purity = await this.prisma.goldPurity.findFirst({
        where: { id: dto.purityId, organizationId: user.organizationId },
      });
      if (purity) {
        const parsed = Number(purity.karat);
        if (Number.isFinite(parsed) && parsed > 0) purityKarat = parsed;
      }
    }
    const grams =
      (dto.grams ??
        Number(String(dto.weightLabel).replace(/[^\d.-]/g, ''))) ||
      0;
    if (grams <= 0) {
      throw new BadRequestException('Lot grams must be positive');
    }

    const r = await this.prisma.goldLot.create({
      data: {
        organizationId: user.organizationId,
        code: dto.code,
        weightLabel: dto.weightLabel || `${grams}g`,
        grams,
        purityKarat,
        purityId: dto.purityId,
        statusLabel: dto.statusLabel ?? 'open',
      },
      include: { purity: true },
    });

    const rate = await this.ledger.tryGetLockedRate(user.organizationId);
    await this.ledger.postAdjust(user.organizationId, {
      grams,
      purityKarat,
      direction: 'in',
      reason: `Lot receive ${dto.code}`,
      rateIrt: rate?.buyRateIrt,
    });

    return {
      id: r.id,
      a: r.code,
      b: r.weightLabel,
      c: r.purity?.name ?? `${purityKarat}k`,
    };
  }

  async listRates(user: IAuthUser): Promise<IGoldRateBoardRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldOrgRate.findMany({
      where: { organizationId: user.organizationId },
      orderBy: [{ businessDate: 'desc' }, { sortOrder: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.label,
      b: r.buyRateIrt != null ? String(r.buyRateIrt) : r.buyLabel,
      c: r.sellRateIrt != null ? String(r.sellRateIrt) : r.sellLabel,
    }));
  }

  async listBalances(user: IAuthUser): Promise<IGoldBalanceRow[]> {
    this.assertRead(user);
    const stock = await this.ledger.listStockByKarat(user.organizationId);
    if (stock.length > 0) {
      return stock.map((r, i) => ({
        id: `stock-${r.purityKarat}-${i}`,
        a: 'ORG',
        b: `${r.grams.toFixed(3)}g`,
        c: `${r.purityKarat}k`,
      }));
    }
    const rows = await this.prisma.goldBalance.findMany({
      where: { organizationId: user.organizationId },
      include: { purity: true },
      orderBy: { partyName: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.partyName,
      b: r.grams ? `${Number(r.grams).toFixed(3)}g` : r.weightLabel,
      c: r.purity?.name ?? `${Number(r.purityKarat)}k`,
    }));
  }

  async listMeltedRaw(
    user: IAuthUser,
    kind: 'melted' | 'raw',
  ): Promise<IGoldLotRow[]> {
    this.assertRead(user);
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        organizationId: user.organizationId,
        kind: kind === 'raw' ? 'raw' : 'gold',
      },
      orderBy: { name: 'asc' },
    });
    return items.map((r) => ({
      id: r.id,
      a: r.name,
      b: r.weight,
      c: r.purity,
    }));
  }

  calculate(dto: GoldCalculatorDto): IGoldCalculatorResult {
    const fee = dto.fee ?? 0;
    const goldValue = Math.round(dto.weight * dto.purity * dto.rate);
    const total = goldValue + fee;
    const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
    return {
      weight: String(dto.weight),
      purity: String(dto.purity),
      rate: fmt(dto.rate),
      fee: fmt(fee),
      goldValue: fmt(goldValue),
      total: fmt(total),
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('gold.read')) {
      throw new ForbiddenException('Missing gold.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      !user.permissions.includes('gold.create') &&
      !user.permissions.includes('gold.update')
    ) {
      throw new ForbiddenException('Missing gold write');
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
