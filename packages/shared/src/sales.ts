export type SaleInvoiceStatus =
  | 'draft'
  | 'confirmed'
  | 'ready'
  | 'completed'
  | 'void';

export type SalePaymentStatus = 'unpaid' | 'partial' | 'paid';

export type SaleSmsEvent =
  | 'confirmed'
  | 'payment_partial'
  | 'payment_paid'
  | 'ready'
  | 'completed'
  | 'void';

export interface ISaleCustomer {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly nationalId: string | null;
  readonly balanceLabel?: string;
  readonly lastTxnLabel?: string;
  readonly totalLabel?: string;
  readonly partyStatus?: 'active' | 'inactive';
}

export interface ISaleInvoice {
  readonly id: string;
  readonly number: string;
  readonly status: SaleInvoiceStatus;
  readonly paymentStatus: SalePaymentStatus;
  readonly goldWeightGrams: string;
  readonly amountIRT: string;
  readonly remainingIRT: string;
  readonly seller?: string;
  readonly displayDate?: string;
  readonly amountLabel?: string;
  readonly customer: ISaleCustomer;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ICreateSaleCustomerRequest {
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly nationalId?: string;
}

export interface ICreateSaleInvoiceRequest {
  readonly customerId: string;
  readonly number: string;
  readonly goldWeightGrams: number;
  readonly amountIRT: number;
  readonly remainingIRT?: number;
  readonly confirm?: boolean;
}

export interface IUpdateSaleStatusRequest {
  readonly status: Exclude<SaleInvoiceStatus, 'draft'>;
}

export interface IUpdateSalePaymentRequest {
  readonly paymentStatus: SalePaymentStatus;
  readonly remainingIRT?: number;
}
