import type { ISaleCustomer, ISaleInvoice } from '@zarva/shared';
import type { IPartyRow, ISaleInvoiceRow } from '@zarva/shared';

export function mapSaleCustomerToPartyRow(customer: ISaleCustomer): IPartyRow {
  return {
    id: customer.id,
    name: customer.name,
    contact: customer.phone,
    balance: customer.balanceLabel ?? '۰',
    lastTxn: customer.lastTxnLabel ?? '—',
    total: customer.totalLabel ?? '—',
    status: customer.partyStatus ?? 'active',
  };
}

export function mapSaleInvoiceToRow(invoice: ISaleInvoice): ISaleInvoiceRow {
  const status =
    invoice.status === 'confirmed' ||
    invoice.status === 'ready' ||
    invoice.status === 'completed' ||
    invoice.status === 'draft' ||
    invoice.status === 'void'
      ? invoice.status
      : 'draft';

  return {
    id: invoice.id,
    number: invoice.number,
    customer: invoice.customer.name,
    date: invoice.displayDate || invoice.createdAt.slice(0, 10),
    goldWeight: invoice.goldWeightGrams,
    amount: invoice.amountLabel || invoice.amountIRT,
    paymentStatus: invoice.paymentStatus,
    seller: invoice.seller ?? '—',
    status,
  };
}
