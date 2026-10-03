import type { PrismaClient } from '@prisma/client';

export interface ILowStockRuleOptions {
  readonly thresholdQty?: number;
}

export async function refreshLowStockInsights(
  prisma: PrismaClient,
  organizationId: string,
  options: ILowStockRuleOptions = {},
): Promise<number> {
  const threshold = options.thresholdQty ?? 2;
  const lowItems = await prisma.inventoryItem.findMany({
    where: {
      organizationId,
      qty: { lte: threshold },
      status: 'available',
    },
    select: { id: true, name: true, sku: true, qty: true },
    take: 50,
  });

  let created = 0;
  for (const item of lowItems) {
    const code = `inventory.low_stock.${item.sku}`;
    const existing = await prisma.aiInsight.findFirst({
      where: {
        organizationId,
        code,
        dismissedAt: null,
      },
    });
    if (existing) {
      continue;
    }
    await prisma.aiInsight.create({
      data: {
        organizationId,
        code,
        title: 'Low stock',
        body: `${item.name} (${item.sku}) qty=${item.qty}`,
        severity: item.qty <= 0 ? 'critical' : 'warning',
        source: 'rules',
        payload: { inventoryItemId: item.id, qty: item.qty },
      },
    });
    created += 1;
  }
  return created;
}
