import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IGoldBalanceRow,
  IGoldCalculatorResult,
  IGoldLotRow,
  IGoldPurityRow,
  IGoldRateBoardRow,
  IGoldTxnRow,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type {
  CreateGoldLotDto,
  CreateGoldPurityDto,
  CreateGoldTxnDto,
  GoldCalculatorDto,
} from './dto/gold.dto';

@Injectable()
export class GoldService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createTxn(user: IAuthUser, dto: CreateGoldTxnDto): Promise<IGoldTxnRow> {
    this.assertWrite(user);
    const r = await this.prisma.goldTxn.create({
      data: {
        organizationId: user.organizationId,
        displayDate: dto.displayDate,
        typeLabel: dto.typeLabel,
        weight: dto.weight,
        purity: dto.purity,
        fineGold: dto.fineGold,
        counterparty: dto.counterparty,
        reference: dto.reference,
      },
    });
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
    const r = await this.prisma.goldLot.create({
      data: {
        organizationId: user.organizationId,
        code: dto.code,
        weightLabel: dto.weightLabel,
        purityId: dto.purityId,
        statusLabel: dto.statusLabel ?? 'open',
      },
      include: { purity: true },
    });
    return {
      id: r.id,
      a: r.code,
      b: r.weightLabel,
      c: r.purity?.name ?? r.statusLabel,
    };
  }

  async listBalances(user: IAuthUser): Promise<IGoldBalanceRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldBalance.findMany({
      where: { organizationId: user.organizationId },
      include: { purity: true },
      orderBy: { partyName: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.partyName,
      b: r.weightLabel,
      c: r.purity?.name ?? '—',
    }));
  }

  async listRates(user: IAuthUser): Promise<IGoldRateBoardRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.goldOrgRate.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.label,
      b: r.buyLabel,
      c: r.sellLabel,
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
