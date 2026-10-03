import { getTranslations } from 'next-intl/server';

import type { InventoryListKind } from '@/features/inventory/inventory-section-loader';

export async function getInventoryListPageProps(kind: InventoryListKind) {
  const t = await getTranslations('modules.inventory');
  const headers = [t('cols.name'), t('cols.sku'), t('cols.value')] as const;

  const byKind: Record<
    InventoryListKind,
    { readonly titleKey: string; readonly descriptionKey: string }
  > = {
    movements: { titleKey: 'nav.movements', descriptionKey: 'movementsDescription' },
    warehouses: { titleKey: 'nav.warehouses', descriptionKey: 'warehousesDescription' },
    'low-stock': { titleKey: 'nav.lowStock', descriptionKey: 'lowStockDescription' },
    valuation: { titleKey: 'nav.valuation', descriptionKey: 'valuationDescription' },
    adjustments: { titleKey: 'nav.adjustments', descriptionKey: 'adjustmentsDescription' },
    barcodes: { titleKey: 'nav.barcodes', descriptionKey: 'barcodesDescription' },
  };

  return { kind, headers, ...byKind[kind] };
}
