import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ORG_GOLD_STOCK_PARTY,
  businessDateKey,
  fineGramsFromKarat,
  type GoldLedgerDirection,
  type GoldLedgerSourceType,
  type ICorrectGoldRateRequest,
  type IGoldAdjustRequest,
  type IGoldLedgerLine,
  type IGoldLockedRate,
  type IGoldRateCorrection,
  type ILockGoldRateRequest,
} from '@zarva/shared';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

type TxClient = Prisma.TransactionClient;

export interface IPartialReverseLine {
  readonly purityKarat: number;
  readonly grams: number;
}

@Injectable()
export class GoldLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async assertBusinessDayOpen(
    organizationId: string,
    businessDate: string,
  ): Promise<void> {
    const key = businessDateKey(businessDate);
    const closed = await this.prisma.dayClose.findUnique({
      where: {
        organizationId_businessDate: {
          organizationId,
          businessDate: new Date(key),
        },
      },
    });
    if (closed && !closed.reopenedAt) {
      throw new ConflictException(`Business day ${key} is closed`);
    }
  }

  async getLockedRate(
    organizationId: string,
    businessDate: string = businessDateKey(),
  ): Promise<IGoldLockedRate> {
    const key = businessDateKey(businessDate);
    const row = await this.prisma.goldOrgRate.findFirst({
      where: {
        organizationId,
        businessDate: new Date(key),
        lockedAt: { not: null },
      },
    });
    if (!row || row.buyRateIrt == null || row.sellRateIrt == null || !row.lockedAt) {
      throw new ConflictException('Daily gold rate is not locked for this date');
    }
    return this.mapLockedRate(row);
  }

  async tryGetLockedRate(
    organizationId: string,
    businessDate: string = businessDateKey(),
  ): Promise<IGoldLockedRate | null> {
    try {
      return await this.getLockedRate(organizationId, businessDate);
    } catch (e) {
      if (e instanceof ConflictException) return null;
      throw e;
    }
  }

  async lockRate(
    organizationId: string,
    dto: ILockGoldRateRequest,
  ): Promise<IGoldLockedRate> {
    const businessDate = businessDateKey(dto.businessDate);
    if (dto.buyRateIrt < 1 || dto.sellRateIrt < 1) {
      throw new BadRequestException('Rates must be positive');
    }
    await this.assertBusinessDayOpen(organizationId, businessDate);

    const existing = await this.prisma.goldOrgRate.findFirst({
      where: { organizationId, businessDate: new Date(businessDate) },
    });
    if (existing?.lockedAt) {
      throw new ConflictException('Rate already locked for this date');
    }

    const data = {
      label: dto.label?.trim() || `نرخ ${businessDate}`,
      buyLabel: String(dto.buyRateIrt),
      sellLabel: String(dto.sellRateIrt),
      buyRateIrt: dto.buyRateIrt,
      sellRateIrt: dto.sellRateIrt,
      businessDate: new Date(businessDate),
      lockedAt: new Date(),
      sortOrder: 0,
    };

    const row = existing
      ? await this.prisma.goldOrgRate.update({ where: { id: existing.id }, data })
      : await this.prisma.goldOrgRate.create({
          data: { organizationId, ...data },
        });

    return this.mapLockedRate(row);
  }

  async correctRate(
    organizationId: string,
    userId: string | null,
    dto: ICorrectGoldRateRequest,
  ): Promise<IGoldLockedRate> {
    const businessDate = businessDateKey(dto.businessDate);
    if (dto.buyRateIrt < 1 || dto.sellRateIrt < 1) {
      throw new BadRequestException('Rates must be positive');
    }
    if (!dto.reason.trim() || dto.reason.trim().length < 3) {
      throw new BadRequestException('Correction reason is required');
    }
    await this.assertBusinessDayOpen(organizationId, businessDate);

    const existing = await this.prisma.goldOrgRate.findFirst({
      where: { organizationId, businessDate: new Date(businessDate) },
    });
    if (!existing?.lockedAt || existing.buyRateIrt == null || existing.sellRateIrt == null) {
      throw new ConflictException('Rate must be locked before correction');
    }

    const prevBuy = Number(existing.buyRateIrt);
    const prevSell = Number(existing.sellRateIrt);

    const [row] = await this.prisma.$transaction([
      this.prisma.goldOrgRate.update({
        where: { id: existing.id },
        data: {
          buyRateIrt: dto.buyRateIrt,
          sellRateIrt: dto.sellRateIrt,
          buyLabel: String(dto.buyRateIrt),
          sellLabel: String(dto.sellRateIrt),
        },
      }),
      this.prisma.goldRateCorrection.create({
        data: {
          organizationId,
          businessDate: new Date(businessDate),
          prevBuyRateIrt: prevBuy,
          prevSellRateIrt: prevSell,
          nextBuyRateIrt: dto.buyRateIrt,
          nextSellRateIrt: dto.sellRateIrt,
          reason: dto.reason.trim(),
          correctedByUserId: userId,
        },
      }),
    ]);

    return this.mapLockedRate(row);
  }

  async listRateCorrections(
    organizationId: string,
    businessDate?: string,
  ): Promise<IGoldRateCorrection[]> {
    const rows = await this.prisma.goldRateCorrection.findMany({
      where: {
        organizationId,
        ...(businessDate
          ? { businessDate: new Date(businessDateKey(businessDate)) }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      businessDate: businessDateKey(r.businessDate),
      prevBuyRateIrt: Number(r.prevBuyRateIrt),
      prevSellRateIrt: Number(r.prevSellRateIrt),
      nextBuyRateIrt: Number(r.nextBuyRateIrt),
      nextSellRateIrt: Number(r.nextSellRateIrt),
      reason: r.reason,
      correctedByUserId: r.correctedByUserId,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async postSaleOut(
    organizationId: string,
    sourceId: string,
    lines: ReadonlyArray<IGoldLedgerLine>,
    displayDate: string,
    tx?: TxClient,
  ): Promise<void> {
    await this.postMovement(
      organizationId,
      'sale',
      sourceId,
      'out',
      'فروش',
      lines,
      displayDate,
      tx,
    );
  }

  async postBuybackIn(
    organizationId: string,
    sourceId: string,
    lines: ReadonlyArray<IGoldLedgerLine>,
    displayDate: string,
    tx?: TxClient,
  ): Promise<void> {
    await this.postMovement(
      organizationId,
      'buyback',
      sourceId,
      'in',
      'خرید طلای کهنه',
      lines,
      displayDate,
      tx,
    );
  }

  async postPurchaseIn(
    organizationId: string,
    sourceId: string,
    lines: ReadonlyArray<IGoldLedgerLine>,
    displayDate: string,
    tx?: TxClient,
  ): Promise<void> {
    await this.postMovement(
      organizationId,
      'purchase',
      sourceId,
      'in',
      'خرید',
      lines,
      displayDate,
      tx,
    );
  }

  async postAdjust(organizationId: string, dto: IGoldAdjustRequest): Promise<void> {
    if (!dto.reason.trim()) {
      throw new BadRequestException('Adjust reason is required');
    }
    if (dto.grams <= 0) {
      throw new BadRequestException('Grams must be positive');
    }
    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.assertBusinessDayOpen(organizationId, displayDate);
    const sourceId = `adjust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.prisma.$transaction(async (tx) => {
      await this.postMovement(
        organizationId,
        'adjust',
        sourceId,
        dto.direction,
        'تعدیل',
        [
          {
            grams: dto.grams,
            purityKarat: dto.purityKarat,
            rateIrt: dto.rateIrt ?? 0,
            counterparty: ORG_GOLD_STOCK_PARTY,
          },
        ],
        displayDate,
        tx,
        dto.reason.trim(),
      );
    });
  }

  async reverseBySource(
    organizationId: string,
    sourceType: GoldLedgerSourceType,
    sourceId: string,
    tx?: TxClient,
  ): Promise<void> {
    const db = tx ?? this.prisma;
    const existing = await db.goldTxn.findMany({
      where: { organizationId, sourceType, sourceId },
    });
    if (existing.length === 0) return;

    const alreadyReversed = await db.goldTxn.findFirst({
      where: {
        organizationId,
        sourceType: 'reversal',
        sourceId: `${sourceType}:${sourceId}`,
      },
    });
    if (alreadyReversed) return;

    for (const row of existing) {
      const reverseDirection: GoldLedgerDirection =
        row.direction === 'in' ? 'out' : 'in';
      const grams = Number(row.grams);
      const karat = Number(row.purityKarat);
      await this.applyBalanceDelta(db, organizationId, karat, reverseDirection, grams);
      await db.goldTxn.create({
        data: {
          organizationId,
          displayDate: row.displayDate,
          typeLabel: `برگشت ${row.typeLabel}`,
          weight: String(grams),
          purity: String(karat),
          fineGold: String(fineGramsFromKarat(grams, karat)),
          counterparty: row.counterparty,
          reference: `REV-${row.reference}`,
          grams,
          fineGrams: fineGramsFromKarat(grams, karat),
          purityKarat: karat,
          rateIrt: row.rateIrt,
          direction: reverseDirection,
          sourceType: 'reversal',
          sourceId: `${sourceType}:${sourceId}`,
          reason: `Reverse ${sourceType}`,
        },
      });
    }
  }

  async reverseBySourcePartial(
    organizationId: string,
    sourceType: GoldLedgerSourceType,
    sourceId: string,
    lines: ReadonlyArray<IPartialReverseLine>,
    tx?: TxClient,
  ): Promise<void> {
    if (lines.length === 0) {
      throw new BadRequestException('Partial reverse lines required');
    }
    const db = tx ?? this.prisma;
    const originals = await db.goldTxn.findMany({
      where: { organizationId, sourceType, sourceId },
    });
    if (originals.length === 0) {
      throw new BadRequestException('No ledger entries to reverse');
    }

    const priorPartials = await db.goldTxn.findMany({
      where: {
        organizationId,
        sourceType: 'reversal',
        sourceId: { startsWith: `${sourceType}:${sourceId}:partial:` },
      },
    });

    for (const line of lines) {
      if (line.grams <= 0) {
        throw new BadRequestException('Partial reverse grams must be positive');
      }
      const karat = line.purityKarat;
      const originalIn = originals
        .filter((o) => Number(o.purityKarat) === karat)
        .reduce((s, o) => {
          const g = Number(o.grams);
          return s + (o.direction === 'in' ? g : -g);
        }, 0);
      const alreadyOut = priorPartials
        .filter((p) => Number(p.purityKarat) === karat)
        .reduce((s, p) => {
          const g = Number(p.grams);
          return s + (p.direction === 'out' ? g : -g);
        }, 0);
      const remaining = Math.abs(originalIn) - Math.abs(alreadyOut);
      if (line.grams > remaining + 0.0005) {
        throw new BadRequestException(
          `Cannot reverse ${line.grams}g of ${karat}k (remaining ${remaining}g)`,
        );
      }

      const sample = originals.find((o) => Number(o.purityKarat) === karat);
      if (!sample) {
        throw new BadRequestException(`No original stock for ${karat}k`);
      }
      const reverseDirection: GoldLedgerDirection =
        sample.direction === 'in' ? 'out' : 'in';
      const displayDate = sample.displayDate;
      const partialId = `${sourceType}:${sourceId}:partial:${Date.now()}-${karat}`;

      await this.applyBalanceDelta(
        db,
        organizationId,
        karat,
        reverseDirection,
        line.grams,
      );
      await db.goldTxn.create({
        data: {
          organizationId,
          displayDate,
          typeLabel: `برگشت جزئی ${sample.typeLabel}`,
          weight: String(line.grams),
          purity: String(karat),
          fineGold: String(fineGramsFromKarat(line.grams, karat)),
          counterparty: sample.counterparty,
          reference: `REV-P-${sample.reference}`,
          grams: line.grams,
          fineGrams: fineGramsFromKarat(line.grams, karat),
          purityKarat: karat,
          rateIrt: sample.rateIrt,
          direction: reverseDirection,
          sourceType: 'reversal',
          sourceId: partialId,
          reason: `Partial reverse ${sourceType}`,
        },
      });
    }
  }

  async stockAsOf(
    organizationId: string,
    asOfDate: string,
  ): Promise<Array<{ purityKarat: number; grams: number }>> {
    const key = businessDateKey(asOfDate);
    const txns = await this.prisma.goldTxn.findMany({
      where: {
        organizationId,
        displayDate: { lte: key },
        grams: { gt: 0 },
      },
    });
    const map = new Map<number, number>();
    for (const t of txns) {
      const karat = Number(t.purityKarat);
      const g = Number(t.grams);
      const delta = t.direction === 'in' ? g : -g;
      map.set(karat, (map.get(karat) ?? 0) + delta);
    }
    return [...map.entries()]
      .map(([purityKarat, grams]) => ({
        purityKarat,
        grams: Math.round(grams * 1000) / 1000,
      }))
      .sort((a, b) => a.purityKarat - b.purityKarat);
  }

  async sumStockGrams(organizationId: string): Promise<number> {
    const rows = await this.prisma.goldBalance.findMany({
      where: { organizationId, partyName: ORG_GOLD_STOCK_PARTY },
    });
    return rows.reduce((sum, r) => sum + Number(r.grams), 0);
  }

  /** Chronological gold metal ledger with running org stock balance (grams). */
  async listLedgerEntries(organizationId: string): Promise<
    Array<{
      id: string;
      date: string;
      description: string;
      debit: string;
      credit: string;
      balance: string;
      purityKarat: number;
      direction: 'in' | 'out';
      grams: number;
    }>
  > {
    const rows = await this.prisma.goldTxn.findMany({
      where: { organizationId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    let running = 0;
    return rows.map((r) => {
      const grams = Number(r.grams);
      const purityKarat = Number(r.purityKarat);
      const direction = r.direction === 'out' ? 'out' : 'in';
      running += direction === 'in' ? grams : -grams;
      const bal = Math.round(running * 1000) / 1000;
      const gramsLabel = grams.toFixed(3);
      return {
        id: r.id,
        date: r.displayDate,
        description: `${r.typeLabel} · ${purityKarat}k · ${r.counterparty}`,
        debit: direction === 'in' ? gramsLabel : '',
        credit: direction === 'out' ? gramsLabel : '',
        balance: bal.toFixed(3),
        purityKarat,
        direction: direction as 'in' | 'out',
        grams,
      };
    });
  }

  async listStockByKarat(
    organizationId: string,
  ): Promise<Array<{ purityKarat: number; grams: number; fineGrams: number }>> {
    const rows = await this.prisma.goldBalance.findMany({
      where: { organizationId, partyName: ORG_GOLD_STOCK_PARTY },
      orderBy: { purityKarat: 'asc' },
    });
    return rows.map((r) => ({
      purityKarat: Number(r.purityKarat),
      grams: Number(r.grams),
      fineGrams: Number(r.fineGrams),
    }));
  }

  private async postMovement(
    organizationId: string,
    sourceType: GoldLedgerSourceType,
    sourceId: string,
    direction: GoldLedgerDirection,
    typeLabel: string,
    lines: ReadonlyArray<IGoldLedgerLine>,
    displayDate: string,
    tx?: TxClient,
    reason = '',
  ): Promise<void> {
    if (lines.length === 0) {
      throw new BadRequestException('Ledger lines required');
    }
    const dateKey = businessDateKey(displayDate);

    const run = async (db: TxClient) => {
      const prior = await db.goldTxn.findFirst({
        where: { organizationId, sourceType, sourceId },
      });
      if (prior) return;

      for (const [index, line] of lines.entries()) {
        if (line.grams <= 0) {
          throw new BadRequestException('Line grams must be positive');
        }
        if (line.purityKarat < 1 || line.purityKarat > 24) {
          throw new BadRequestException('Invalid purity karat');
        }
        const fine = fineGramsFromKarat(line.grams, line.purityKarat);
        await this.applyBalanceDelta(
          db,
          organizationId,
          line.purityKarat,
          direction,
          line.grams,
        );
        await db.goldTxn.create({
          data: {
            organizationId,
            displayDate: dateKey,
            typeLabel,
            weight: String(line.grams),
            purity: String(line.purityKarat),
            fineGold: String(fine),
            counterparty: line.counterparty,
            reference: `${sourceType}:${sourceId}:${index}`,
            grams: line.grams,
            fineGrams: fine,
            purityKarat: line.purityKarat,
            rateIrt: line.rateIrt,
            direction,
            sourceType,
            sourceId,
            reason,
          },
        });
      }
    };

    if (tx) {
      await run(tx);
      return;
    }
    await this.prisma.$transaction(async (inner) => run(inner));
  }

  private async applyBalanceDelta(
    db: TxClient,
    organizationId: string,
    purityKarat: number,
    direction: GoldLedgerDirection,
    grams: number,
  ): Promise<void> {
    const delta = direction === 'in' ? grams : -grams;

    type LockedRow = { id: string; grams: Prisma.Decimal };
    let locked = await db.$queryRaw<LockedRow[]>`
      SELECT id, grams FROM "GoldBalance"
      WHERE "organizationId" = ${organizationId}
        AND "partyName" = ${ORG_GOLD_STOCK_PARTY}
        AND "purityKarat" = ${purityKarat}
      FOR UPDATE
    `;

    if (locked.length === 0) {
      if (delta < 0) {
        throw new BadRequestException(
          `Insufficient gold stock for ${purityKarat}k (need ${grams}g)`,
        );
      }
      try {
        await db.goldBalance.create({
          data: {
            organizationId,
            partyName: ORG_GOLD_STOCK_PARTY,
            purityKarat,
            grams: 0,
            fineGrams: 0,
            weightLabel: '0.000g',
          },
        });
      } catch {
        // concurrent create — continue to lock
      }
      locked = await db.$queryRaw<LockedRow[]>`
        SELECT id, grams FROM "GoldBalance"
        WHERE "organizationId" = ${organizationId}
          AND "partyName" = ${ORG_GOLD_STOCK_PARTY}
          AND "purityKarat" = ${purityKarat}
        FOR UPDATE
      `;
    }

    if (locked.length === 0) {
      throw new BadRequestException(
        `Unable to lock gold stock for ${purityKarat}k`,
      );
    }

    const nextGrams = Number(locked[0].grams) + delta;
    if (nextGrams < -0.0005) {
      throw new BadRequestException(
        `Insufficient gold stock for ${purityKarat}k (need ${grams}g)`,
      );
    }

    const fine = fineGramsFromKarat(Math.max(nextGrams, 0), purityKarat);
    await db.goldBalance.update({
      where: { id: locked[0].id },
      data: {
        grams: nextGrams,
        fineGrams: fine,
        weightLabel: `${nextGrams.toFixed(3)}g`,
      },
    });
  }

  private mapLockedRate(row: {
    id: string;
    label: string;
    buyRateIrt: Prisma.Decimal | number | null;
    sellRateIrt: Prisma.Decimal | number | null;
    businessDate: Date | null;
    lockedAt: Date | null;
  }): IGoldLockedRate {
    if (
      row.buyRateIrt == null ||
      row.sellRateIrt == null ||
      !row.businessDate ||
      !row.lockedAt
    ) {
      throw new NotFoundException('Locked rate incomplete');
    }
    return {
      id: row.id,
      label: row.label,
      buyRateIrt: Number(row.buyRateIrt),
      sellRateIrt: Number(row.sellRateIrt),
      businessDate: businessDateKey(row.businessDate),
      lockedAt: row.lockedAt.toISOString(),
    };
  }
}
