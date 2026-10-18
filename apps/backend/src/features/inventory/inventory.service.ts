import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IInventoryRow,
  IInventorySummary,
  IInventoryValuationRow,
  IStockMovementRow,
  IWarehouseRow,
} from '@zarva/shared';
import { businessDateKey, fineGramsFromKarat } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { GoldLedgerService } from '../gold/gold-ledger.service';
import type {
  CreateAdjustmentDto,
  CreateInventoryItemDto,
  CreateStockMovementDto,
  CreateWarehouseDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldLedger: GoldLedgerService,
  ) {}

  async listItems(user: IAuthUser): Promise<IInventoryRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.inventoryItem.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapItem(r));
  }

  async summary(user: IAuthUser): Promise<IInventorySummary> {
    this.assertRead(user);
    const rate = await this.goldLedger.tryGetLockedRate(
      user.organizationId,
      businessDateKey(),
    );
    const buyRate = rate?.buyRateIrt ?? 0;
    const rows = await this.prisma.inventoryItem.findMany({
      where: { organizationId: user.organizationId },
      select: {
        qty: true,
        status: true,
        weight: true,
        valueLabel: true,
        purity: true,
        kind: true,
      },
    });
    let totalValueIrt = 0;
    let totalWeightGrams = 0;
    let lowStockCount = 0;
    for (const r of rows) {
      if (r.status === 'low' || r.qty <= 2) lowStockCount += 1;
      totalValueIrt += this.computeItemValueIrt(r, buyRate);
      totalWeightGrams += parseLabelNumber(r.weight) * Math.max(r.qty, 0);
    }
    return {
      skuCount: rows.length,
      lowStockCount,
      totalValueIrt: Math.round(totalValueIrt),
      totalWeightGrams: Math.round(totalWeightGrams * 1000) / 1000,
    };
  }

  private computeItemValueIrt(
    r: {
      qty: number;
      weight: string;
      valueLabel: string;
      purity: string;
      kind: string;
    },
    buyRateIrt: number,
  ): number {
    if (r.kind === 'gold' || r.kind === 'raw') {
      const grams = parseLabelNumber(r.weight) * Math.max(r.qty, 0);
      const karat = parseLabelNumber(r.purity) || 18;
      if (grams > 0 && buyRateIrt > 0) {
        return Math.round(fineGramsFromKarat(grams, karat) * buyRateIrt);
      }
    }
    return Math.round(parseLabelNumber(r.valueLabel));
  }

  async getItem(user: IAuthUser, id: string): Promise<IInventoryRow> {
    this.assertRead(user);
    const row = await this.prisma.inventoryItem.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!row) throw new NotFoundException('Item not found');
    return this.mapItem(row);
  }

  async createItem(user: IAuthUser, dto: CreateInventoryItemDto): Promise<IInventoryRow> {
    this.assertWrite(user);
    const row = await this.prisma.inventoryItem.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name.trim(),
        sku: dto.sku.trim(),
        barcode: dto.barcode.trim(),
        weight: dto.weight,
        purity: dto.purity,
        qty: dto.qty,
        location: dto.location,
        valueLabel: dto.valueLabel,
        warehouseId: dto.warehouseId,
        kind: dto.kind ?? 'jewelry',
        status: dto.qty <= 2 ? 'low' : 'available',
      },
    });
    return this.mapItem(row);
  }

  async listWarehouses(user: IAuthUser): Promise<IWarehouseRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.warehouse.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      itemCount: r._count.items,
    }));
  }

  async createWarehouse(user: IAuthUser, dto: CreateWarehouseDto): Promise<IWarehouseRow> {
    this.assertWrite(user);
    const row = await this.prisma.warehouse.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name.trim(),
        city: dto.city?.trim() ?? '',
      },
    });
    return { id: row.id, name: row.name, city: row.city, itemCount: 0 };
  }

  async listMovements(user: IAuthUser): Promise<IStockMovementRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.stockMovement.findMany({
      where: { organizationId: user.organizationId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      col1: r.item.name,
      col2: `${r.kind} × ${r.qty}`,
      col3: r.displayDate,
      kind: r.kind,
    }));
  }

  async createMovement(user: IAuthUser, dto: CreateStockMovementDto): Promise<IStockMovementRow> {
    this.assertWrite(user);
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.itemId, organizationId: user.organizationId },
    });
    if (!item) throw new NotFoundException('Item not found');

    let nextQty = item.qty;
    if (dto.kind === 'IN') nextQty += Math.abs(dto.qty);
    else if (dto.kind === 'OUT') nextQty -= Math.abs(dto.qty);
    else if (dto.kind === 'ADJUST') nextQty += dto.qty;
    if (nextQty < 0) throw new BadRequestException('Insufficient stock');

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          organizationId: user.organizationId,
          itemId: item.id,
          kind: dto.kind,
          qty: dto.qty,
          note: dto.note ?? '',
          displayDate: dto.displayDate,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
        },
        include: { item: true },
      }),
      this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          qty: nextQty,
          status: nextQty <= 2 ? 'low' : 'available',
          warehouseId: dto.toWarehouseId ?? item.warehouseId,
        },
      }),
    ]);

    return {
      id: movement.id,
      col1: movement.item.name,
      col2: `${movement.kind} × ${movement.qty}`,
      col3: movement.displayDate,
      kind: movement.kind,
    };
  }

  async listLowStock(user: IAuthUser): Promise<IInventoryRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.inventoryItem.findMany({
      where: {
        organizationId: user.organizationId,
        OR: [{ status: 'low' }, { qty: { lte: 2 } }],
      },
      orderBy: { qty: 'asc' },
    });
    return rows.map((r) => this.mapItem(r));
  }

  async adjust(user: IAuthUser, dto: CreateAdjustmentDto): Promise<IStockMovementRow> {
    return this.createMovement(user, {
      itemId: dto.itemId,
      kind: 'ADJUST',
      qty: dto.qtyDelta,
      displayDate: dto.displayDate,
      note: dto.note,
    });
  }

  async valuation(user: IAuthUser): Promise<IInventoryValuationRow[]> {
    this.assertRead(user);
    const rate = await this.goldLedger.tryGetLockedRate(
      user.organizationId,
      businessDateKey(),
    );
    const buyRate = rate?.buyRateIrt ?? 0;
    const rows = await this.prisma.inventoryItem.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => {
      const valueIrt = this.computeItemValueIrt(r, buyRate);
      return {
        id: r.id,
        col1: r.name,
        col2: `${r.qty}`,
        col3: String(valueIrt),
      };
    });
  }

  async findByBarcode(user: IAuthUser, code: string): Promise<IInventoryRow> {
    this.assertRead(user);
    const row = await this.prisma.inventoryItem.findFirst({
      where: { organizationId: user.organizationId, barcode: code },
    });
    if (!row) throw new NotFoundException('Barcode not found');
    return this.mapItem(row);
  }

  private mapItem(r: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    weight: string;
    purity: string;
    qty: number;
    location: string;
    valueLabel: string;
    status: 'available' | 'reserved' | 'low';
    kind: 'gold' | 'jewelry' | 'coin' | 'raw';
  }): IInventoryRow {
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      barcode: r.barcode,
      weight: r.weight,
      purity: r.purity,
      qty: r.qty,
      location: r.location,
      value: r.valueLabel,
      status: r.status,
      kind: r.kind,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('inventory.read')) {
      throw new ForbiddenException('Missing inventory.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      !user.permissions.includes('inventory.create') &&
      !user.permissions.includes('inventory.update') &&
      !user.permissions.includes('inventory.adjust')
    ) {
      throw new ForbiddenException('Missing inventory write');
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

function parseLabelNumber(value: string): number {
  const normalized = value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
