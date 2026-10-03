import { getTranslations } from 'next-intl/server';

import {
  getInventoryByBarcode,
  getInventoryMovements,
  getInventoryValuation,
  getLowStock,
  getWarehouses,
  inventoryToSimpleRows,
  movementToSimpleRows,
  valuationToSimpleRows,
  warehouseToSimpleRows,
} from '@/features/inventory/get-inventory-data';
import {
  INVENTORY_ROWS_KPI_SLOTS,
  resolveInventorySkeletonKpis,
} from '@/features/inventory/inventory-kpi-slots';
import { InventorySimpleList } from '@/features/inventory/inventory-simple-list';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

export type InventoryListKind =
  | 'movements'
  | 'warehouses'
  | 'low-stock'
  | 'valuation'
  | 'adjustments'
  | 'barcodes';

interface IProps {
  readonly kind: InventoryListKind;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly headers: readonly [string, string, string];
  readonly barcode?: string;
}

async function InventorySectionLoaded({
  kind,
  titleKey,
  descriptionKey,
  headers,
  barcode,
}: IProps) {
  const result = await loadServerApiSection(async () => {
    if (kind === 'movements') {
      return movementToSimpleRows(await getInventoryMovements());
    }
    if (kind === 'warehouses') {
      return warehouseToSimpleRows(await getWarehouses());
    }
    if (kind === 'low-stock') {
      return inventoryToSimpleRows(await getLowStock());
    }
    if (kind === 'valuation') {
      return valuationToSimpleRows(await getInventoryValuation());
    }
    if (kind === 'adjustments') {
      const data = await getInventoryMovements();
      return movementToSimpleRows(data.filter((m) => m.kind === 'ADJUST'));
    }
    if (kind === 'barcodes' && barcode) {
      const item = await getInventoryByBarcode(barcode);
      return inventoryToSimpleRows([item]);
    }
    return [] as ReadonlyArray<{ id: string; col1: string; col2: string; col3: string }>;
  });

  if (!result.ok) {
    return (
      <InventorySimpleList
        titleKey={titleKey}
        descriptionKey={descriptionKey}
        headers={headers}
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }

  return (
    <InventorySimpleList
      titleKey={titleKey}
      descriptionKey={descriptionKey}
      headers={headers}
      rows={result.data}
      chrome="body"
    />
  );
}

export async function InventorySectionLoader(props: IProps) {
  const t = await getTranslations('modules.inventory');
  return (
    <StreamedDomainChrome
      messageNs="modules.inventory"
      titlePath={props.titleKey}
      descriptionPath={props.descriptionKey}
      pathForNav="/inventory"
      skeletonKpis={resolveInventorySkeletonKpis(t, INVENTORY_ROWS_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={[t(props.headers[0]), t(props.headers[1]), t(props.headers[2])]}
    >
      <InventorySectionLoaded {...props} />
    </StreamedDomainChrome>
  );
}
