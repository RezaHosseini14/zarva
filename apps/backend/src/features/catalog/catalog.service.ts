import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IGoldTxnRow,
  IInventoryRow,
  ILedgerRow,
  IPartyRow,
  IPurchaseRow,
  IWorkshopOrderRow,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listSuppliers(user: IAuthUser): Promise<IPartyRow[]> {
    this.assertPerm(user, 'suppliers.read');
    const rows = await this.prisma.supplier.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapParty(r));
  }

  async getSupplier(user: IAuthUser, id: string): Promise<IPartyRow> {
    this.assertPerm(user, 'suppliers.read');
    const row = await this.prisma.supplier.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!row) throw new NotFoundException('Supplier not found');
    return this.mapParty(row);
  }

  async listPurchases(user: IAuthUser): Promise<IPurchaseRow[]> {
    this.assertPerm(user, 'purchases.read');
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

  async getPurchase(user: IAuthUser, id: string): Promise<IPurchaseRow> {
    this.assertPerm(user, 'purchases.read');
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

  async listInventory(user: IAuthUser): Promise<IInventoryRow[]> {
    this.assertPerm(user, 'inventory.read');
    const rows = await this.prisma.inventoryItem.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapInventory(r));
  }

  async getInventoryItem(user: IAuthUser, id: string): Promise<IInventoryRow> {
    this.assertPerm(user, 'inventory.read');
    const r = await this.prisma.inventoryItem.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!r) throw new NotFoundException('Inventory item not found');
    return this.mapInventory(r);
  }

  async listGoldTxns(user: IAuthUser): Promise<IGoldTxnRow[]> {
    this.assertPerm(user, 'gold.read');
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

  async listWorkshopOrders(user: IAuthUser): Promise<IWorkshopOrderRow[]> {
    this.assertPerm(user, 'workshop.read');
    const rows = await this.prisma.workshopOrder.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      order: r.orderNumber,
      customer: r.customerName,
      product: r.product,
      artisan: r.artisan,
      due: r.dueLabel,
      status: r.statusLabel,
      progress: r.progress,
    }));
  }

  async listLedger(user: IAuthUser): Promise<ILedgerRow[]> {
    this.assertPerm(user, 'accounting.read');
    const rows = await this.prisma.ledgerEntry.findMany({
      where: { organizationId: user.organizationId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      date: r.displayDate,
      description: r.description,
      debit: r.debitLabel,
      credit: r.creditLabel,
      balance: r.balanceLabel,
    }));
  }

  private mapParty(r: {
    id: string;
    name: string;
    phone: string;
    balanceLabel: string;
    lastTxnLabel: string;
    totalLabel: string;
    partyStatus: string;
  }): IPartyRow {
    return {
      id: r.id,
      name: r.name,
      contact: r.phone,
      balance: r.balanceLabel,
      lastTxn: r.lastTxnLabel,
      total: r.totalLabel,
      status: r.partyStatus === 'inactive' ? 'inactive' : 'active',
    };
  }

  private mapInventory(r: {
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

  private assertPerm(user: IAuthUser, key: string): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.permissions.includes(key) ||
      user.permissions.includes('manage')
    ) {
      return;
    }
    throw new ForbiddenException(`Missing ${key}`);
  }
}
