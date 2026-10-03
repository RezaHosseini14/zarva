import type { ISaleCustomer, ISaleInvoice, ISalePaymentRow, ISaleReturnRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getSaleCustomers(): Promise<ReadonlyArray<ISaleCustomer>> {
  return serverApiFetch('/sales/customers');
}

export async function getSaleCustomer(id: string): Promise<ISaleCustomer> {
  return serverApiFetch(`/sales/customers/${id}`);
}

export async function getSaleInvoices(): Promise<ReadonlyArray<ISaleInvoice>> {
  return serverApiFetch('/sales/invoices');
}

export async function getSaleReturns(): Promise<ReadonlyArray<ISaleReturnRow>> {
  return serverApiFetch('/sales/returns');
}

export async function getSalePayments(): Promise<ReadonlyArray<ISalePaymentRow>> {
  return serverApiFetch('/sales/payments');
}
