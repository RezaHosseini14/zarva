import type {
  IInventoryRow,
  IInventoryValuationRow,
  IStockMovementRow,
  IWarehouseRow,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getInventoryMovements(): Promise<ReadonlyArray<IStockMovementRow>> {
  return serverApiFetch('/inventory/movements');
}

export async function getInventoryWarehouses(): Promise<ReadonlyArray<IWarehouseRow>> {
  return serverApiFetch('/inventory/warehouses');
}

export async function getInventoryLowStock(): Promise<ReadonlyArray<IInventoryRow>> {
  return serverApiFetch('/inventory/low-stock');
}

export async function getInventoryValuation(): Promise<ReadonlyArray<IInventoryValuationRow>> {
  return serverApiFetch('/inventory/valuation');
}

export async function getInventoryByBarcode(code: string): Promise<IInventoryRow> {
  return serverApiFetch(`/inventory/barcodes/${encodeURIComponent(code)}`);
}

/** @deprecated use getInventoryWarehouses */
export const getWarehouses = getInventoryWarehouses;

/** @deprecated use getInventoryLowStock */
export const getLowStock = getInventoryLowStock;

export function warehouseToSimpleRows(
  rows: ReadonlyArray<IWarehouseRow>,
): ReadonlyArray<{ id: string; col1: string; col2: string; col3: string }> {
  return rows.map((r) => ({
    id: r.id,
    col1: r.name,
    col2: r.city,
    col3: String(r.itemCount),
  }));
}

export function movementToSimpleRows(
  rows: ReadonlyArray<IStockMovementRow>,
): ReadonlyArray<{ id: string; col1: string; col2: string; col3: string }> {
  return rows.map((r) => ({
    id: r.id,
    col1: r.col1,
    col2: r.col2,
    col3: r.col3,
  }));
}

export function inventoryToSimpleRows(
  rows: ReadonlyArray<IInventoryRow>,
): ReadonlyArray<{ id: string; col1: string; col2: string; col3: string }> {
  return rows.map((r) => ({
    id: r.id,
    col1: r.name,
    col2: String(r.qty),
    col3: r.status,
  }));
}

export function valuationToSimpleRows(
  rows: ReadonlyArray<IInventoryValuationRow>,
): ReadonlyArray<{ id: string; col1: string; col2: string; col3: string }> {
  return rows.map((r) => ({
    id: r.id,
    col1: r.col1,
    col2: r.col2,
    col3: r.col3,
  }));
}
