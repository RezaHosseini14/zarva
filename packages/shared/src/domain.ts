export type PartyStatus = 'active' | 'inactive';

export interface IPartyRow {
  readonly id: string;
  readonly name: string;
  readonly contact: string;
  readonly balance: string;
  readonly lastTxn: string;
  readonly total: string;
  readonly status: PartyStatus;
}

export interface ISaleInvoiceShop {
  readonly name: string;
  readonly address: string;
  readonly phone: string;
  readonly guildId: string;
}

export interface ISaleInvoiceCustomerDetail {
  readonly name: string;
  readonly phone: string;
  readonly nationalId: string;
}

export interface ISaleInvoiceLineDto {
  readonly id: string;
  readonly description: string;
  readonly weight: string;
  readonly purity: string;
  readonly dailyRate: string;
  readonly goldValue: string;
  readonly wage: string;
  readonly profit: string;
  readonly tax: string;
  readonly lineTotal: string;
}

export interface ISaleInvoiceTotalsDto {
  readonly totalWeight: string;
  readonly goldValue: string;
  readonly wage: string;
  readonly profit: string;
  readonly tax: string;
  readonly grandTotal: string;
  readonly amountInWords: string;
}

export interface ISaleInvoiceRow {
  readonly id: string;
  readonly number: string;
  readonly customer: string;
  readonly date: string;
  readonly goldWeight: string;
  readonly amount: string;
  readonly paymentStatus: 'paid' | 'partial' | 'unpaid';
  readonly seller: string;
  readonly status: 'completed' | 'draft' | 'void' | 'confirmed' | 'ready';
}

export interface ISaleInvoiceDetailDto extends ISaleInvoiceRow {
  readonly shop: ISaleInvoiceShop;
  readonly customerDetail: ISaleInvoiceCustomerDetail;
  readonly lines: ReadonlyArray<ISaleInvoiceLineDto>;
  readonly totals: ISaleInvoiceTotalsDto;
}

export interface IPurchaseRow {
  readonly id: string;
  readonly number: string;
  readonly supplier: string;
  readonly date: string;
  readonly goldWeight: string;
  readonly amount: string;
  readonly paymentStatus: 'paid' | 'partial' | 'unpaid';
}

export interface IInventoryRow {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly barcode: string;
  readonly weight: string;
  readonly purity: string;
  readonly qty: number;
  readonly location: string;
  readonly value: string;
  readonly status: 'available' | 'reserved' | 'low';
  readonly kind: 'gold' | 'jewelry' | 'coin' | 'raw';
}

export interface IGoldTxnRow {
  readonly id: string;
  readonly date: string;
  readonly type: string;
  readonly weight: string;
  readonly purity: string;
  readonly fineGold: string;
  readonly counterparty: string;
  readonly reference: string;
}

export interface IWorkshopOrderRow {
  readonly id: string;
  readonly order: string;
  readonly customer: string;
  readonly product: string;
  readonly artisan: string;
  readonly due: string;
  readonly status: string;
  readonly progress: number;
}

export interface ILedgerRow {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly debit: string;
  readonly credit: string;
  readonly balance: string;
}
