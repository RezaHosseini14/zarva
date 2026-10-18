import type {
  IGoldTxnRow,
  IInventoryRow,
  ILedgerRow,
  IPartyRow,
  IPurchaseRow,
  ISaleInvoiceDetailDto,
  ISuppliersSummary,
  IWorkshopOrderRow,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getSuppliersSummary(): Promise<ISuppliersSummary> {
  return serverApiFetch('/suppliers/summary');
}

export async function getSuppliers(): Promise<ReadonlyArray<IPartyRow>> {
  return serverApiFetch('/suppliers');
}

export async function getSupplier(id: string): Promise<IPartyRow> {
  return serverApiFetch(`/suppliers/${id}`);
}

export async function getPurchases(): Promise<ReadonlyArray<IPurchaseRow>> {
  return serverApiFetch('/purchases');
}

export async function getPurchase(id: string): Promise<IPurchaseRow> {
  return serverApiFetch(`/purchases/${id}`);
}

export async function getInventoryItems(): Promise<ReadonlyArray<IInventoryRow>> {
  return serverApiFetch('/inventory');
}

export async function getInventoryItem(id: string): Promise<IInventoryRow> {
  return serverApiFetch(`/inventory/${id}`);
}

export async function getGoldTxns(): Promise<ReadonlyArray<IGoldTxnRow>> {
  return serverApiFetch('/gold/transactions');
}

export async function getWorkshopOrders(): Promise<ReadonlyArray<IWorkshopOrderRow>> {
  return serverApiFetch('/workshop/orders');
}

export async function getLedgerEntries(): Promise<ReadonlyArray<ILedgerRow>> {
  return serverApiFetch('/accounting/ledger');
}

export async function getSaleInvoiceDetail(id: string): Promise<ISaleInvoiceDetailDto> {
  return serverApiFetch(`/sales/invoices/${id}`);
}
