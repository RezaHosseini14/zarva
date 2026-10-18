export type SaleInvoiceStatus =
  | 'draft'
  | 'confirmed'
  | 'ready'
  | 'completed'
  | 'void';

export type SalePaymentStatus = 'unpaid' | 'partial' | 'paid';

export type SaleDocumentKind = 'sale' | 'buyback';

export type SalePaymentMethod = 'cash' | 'card' | 'transfer';

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
  readonly invoiceCount?: number;
  readonly totalSalesIrt?: number;
  readonly totalPaidIrt?: number;
  readonly openRemainingIrt?: number;
}

export interface ISaleInvoice {
  readonly id: string;
  readonly number: string;
  readonly documentKind: SaleDocumentKind;
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

export interface ISalePayment {
  readonly id: string;
  readonly invoiceId: string;
  readonly ref: string;
  readonly method: SalePaymentMethod | string;
  readonly amountIrt: number;
  readonly displayDate: string;
  readonly createdAt: string;
}

export interface ICreateSaleInvoiceLineRequest {
  readonly description: string;
  readonly weightGrams: number;
  readonly purityKarat: number;
  readonly rateIrt: number;
  readonly wageIrt?: number;
  readonly profitIrt?: number;
  readonly taxIrt?: number;
  readonly discountIrt?: number;
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
  readonly documentKind?: SaleDocumentKind;
  readonly goldWeightGrams?: number;
  readonly amountIRT?: number;
  readonly remainingIRT?: number;
  readonly confirm?: boolean;
  readonly lines?: ReadonlyArray<ICreateSaleInvoiceLineRequest>;
  readonly displayDate?: string;
  readonly seller?: string;
  readonly clientRequestId?: string;
}

export interface ICreateSalePaymentRequest {
  readonly invoiceId: string;
  readonly ref: string;
  readonly method: SalePaymentMethod | string;
  readonly amountIrt: number;
  readonly displayDate?: string;
}

export interface ISaleCheckoutPaymentRequest {
  readonly ref?: string;
  readonly method: SalePaymentMethod;
  readonly amountIrt: number;
}

export interface ISaleCheckoutRequest {
  readonly customerId: string;
  readonly number: string;
  readonly documentKind?: SaleDocumentKind;
  readonly lines: ReadonlyArray<ICreateSaleInvoiceLineRequest>;
  readonly payments: ReadonlyArray<ISaleCheckoutPaymentRequest>;
  readonly displayDate?: string;
  readonly seller?: string;
  readonly clientRequestId?: string;
}

export interface ISaleCheckoutResult {
  readonly invoice: ISaleInvoice;
  readonly payments: ReadonlyArray<ISalePayment>;
}

export interface IUpdateSaleStatusRequest {
  readonly status: Exclude<SaleInvoiceStatus, 'draft'>;
}

export interface IUpdateSalePaymentRequest {
  readonly paymentStatus: SalePaymentStatus;
  readonly remainingIRT?: number;
}
