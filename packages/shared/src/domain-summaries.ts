/** List-page aggregate KPIs — Nest GET …/summary → FE kpiItems. */

export interface ISalesSummary {
  readonly todayAmountIrt: number;
  readonly invoiceCount: number;
  readonly unpaidCount: number;
  readonly avgAmountIrt: number;
}

export interface IPurchasesSummary {
  readonly monthAmountIrt: number;
  readonly openCount: number;
  readonly totalWeightGrams: number;
}

export interface IInventorySummary {
  readonly skuCount: number;
  readonly lowStockCount: number;
  readonly totalValueIrt: number;
  readonly totalWeightGrams: number;
}

export interface ICustomersSummary {
  readonly count: number;
  readonly openReceivablesIrt: number;
  readonly lifetimeSalesIrt: number;
}

export interface ISuppliersSummary {
  readonly count: number;
  readonly openPayablesIrt: number;
  readonly lifetimePurchasesIrt: number;
}

export interface IGoldSummary {
  readonly stockGrams: number;
  readonly txnCount: number;
  readonly lockedRateToday: boolean;
}

export interface IGoldLedgerEntry {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly debit: string;
  readonly credit: string;
  readonly balance: string;
  readonly purityKarat: number;
  readonly direction: 'in' | 'out';
  readonly grams: number;
}

export interface IJewelrySummary {
  readonly pieces: number;
  readonly reserved: number;
  readonly available: number;
}

export interface IWorkshopSummary {
  readonly orders: number;
  readonly openOrders: number;
  readonly artisans: number;
  readonly batches: number;
}

export interface IBranchesSummary {
  readonly total: number;
  readonly active: number;
  readonly inactive: number;
}

export interface ITaxSummary {
  readonly periods: number;
  readonly openPeriods: number;
  readonly filings: number;
  readonly submittedFilings: number;
  readonly adapterConfigured: boolean;
}

export interface IAiSummary {
  readonly insights: number;
  readonly critical: number;
  readonly warnings: number;
}
