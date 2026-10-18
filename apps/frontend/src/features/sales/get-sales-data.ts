import type {
  ICustomersSummary,
  ISaleCustomer,
  ISaleInvoice,
  ISalePaymentRow,
  ISaleReturnRow,
  ISalesSummary,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getSalesSummary(): Promise<ISalesSummary> {
  return serverApiFetch('/sales/summary');
}

export async function getCustomersSummary(): Promise<ICustomersSummary> {
  return serverApiFetch('/sales/customers/summary');
}

export async function getSaleCustomers(): Promise<ReadonlyArray<ISaleCustomer>> {
  return serverApiFetch('/sales/customers');
}

export async function getSaleCustomer(id: string): Promise<ISaleCustomer> {
  return serverApiFetch(`/sales/customers/${id}`);
}

export interface ICustomerSmsCapabilities {
  readonly enabled: boolean;
}

export async function getCustomerSmsCapabilities(): Promise<ICustomerSmsCapabilities> {
  try {
    return await serverApiFetch<ICustomerSmsCapabilities>('/sales/customer-sms/capabilities');
  } catch {
    return { enabled: false };
  }
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
