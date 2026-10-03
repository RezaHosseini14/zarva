/**
 * Legacy mock rows for pages not yet fully wired to Nest.
 * Prefer `@zarva/shared` types + `serverApiFetch` for new work.
 */
export type {
  IInventoryRow,
  IPartyRow,
  IPurchaseRow,
  ISaleInvoiceRow,
} from '@zarva/shared';

import type {
  IInventoryRow,
  IPartyRow,
  IPurchaseRow,
  ISaleInvoiceRow,
} from '@zarva/shared';

export const mockCustomers: ReadonlyArray<IPartyRow> = [
  {
    id: 'c1',
    name: 'Sample Customer',
    contact: '09000000000',
    balance: '۰',
    lastTxn: '—',
    total: '—',
    status: 'active',
  },
];

export const mockSuppliers: ReadonlyArray<IPartyRow> = [
  {
    id: 's1',
    name: 'Sample Supplier',
    contact: '09000000001',
    balance: '۰',
    lastTxn: '—',
    total: '—',
    status: 'active',
  },
];

export const mockSalesInvoices: ReadonlyArray<ISaleInvoiceRow> = [];

export const mockPurchases: ReadonlyArray<IPurchaseRow> = [];

export const mockInventory: ReadonlyArray<IInventoryRow> = [];
