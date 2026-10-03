import { Injectable } from '@nestjs/common';
import type { ISearchResult } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(user: IAuthUser, q: string): Promise<ISearchResult> {
    const query = q.trim();
    if (!query) {
      return { query: '', groups: [] };
    }
    const orgId = user.organizationId;
    const contains = { contains: query, mode: 'insensitive' as const };

    const [customers, invoices, inventory, purchases, gold, workshop] =
      await Promise.all([
        this.prisma.customer.findMany({
          where: { organizationId: orgId, OR: [{ name: contains }, { phone: contains }] },
          take: 8,
        }),
        this.prisma.saleInvoice.findMany({
          where: { organizationId: orgId, number: contains },
          take: 8,
        }),
        this.prisma.inventoryItem.findMany({
          where: {
            organizationId: orgId,
            OR: [{ name: contains }, { sku: contains }, { barcode: contains }],
          },
          take: 8,
        }),
        this.prisma.purchase.findMany({
          where: { organizationId: orgId, number: contains },
          take: 8,
        }),
        this.prisma.goldTxn.findMany({
          where: {
            organizationId: orgId,
            OR: [{ reference: contains }, { counterparty: contains }],
          },
          take: 8,
        }),
        this.prisma.workshopOrder.findMany({
          where: {
            organizationId: orgId,
            OR: [{ orderNumber: contains }, { product: contains }, { customerName: contains }],
          },
          take: 8,
        }),
      ]);

    const groups = [
      {
        type: 'customer',
        hits: customers.map((c) => ({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: c.phone,
          href: `/customers/${c.id}`,
        })),
      },
      {
        type: 'invoice',
        hits: invoices.map((i) => ({
          id: i.id,
          type: 'invoice',
          title: i.number,
          subtitle: i.amountLabel || i.displayDate,
          href: `/sales/invoices/${i.id}`,
        })),
      },
      {
        type: 'inventory',
        hits: inventory.map((i) => ({
          id: i.id,
          type: 'inventory',
          title: i.name,
          subtitle: i.sku,
          href: `/inventory/products/${i.id}`,
        })),
      },
      {
        type: 'purchase',
        hits: purchases.map((p) => ({
          id: p.id,
          type: 'purchase',
          title: p.number,
          subtitle: p.amountLabel,
          href: `/purchases/${p.id}`,
        })),
      },
      {
        type: 'gold',
        hits: gold.map((g) => ({
          id: g.id,
          type: 'gold',
          title: g.reference,
          subtitle: g.counterparty,
          href: `/gold`,
        })),
      },
      {
        type: 'workshop',
        hits: workshop.map((w) => ({
          id: w.id,
          type: 'workshop',
          title: w.orderNumber,
          subtitle: w.product,
          href: `/workshop`,
        })),
      },
    ].filter((g) => g.hits.length > 0);

    return { query, groups };
  }
}
