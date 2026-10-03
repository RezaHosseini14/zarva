/** Production-depth domain DTOs beyond the original catalog list rows. */

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface IChartAccount {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: AccountType;
  readonly isActive: boolean;
}

export interface IJournalLineDto {
  readonly id: string;
  readonly accountId: string;
  readonly accountCode: string;
  readonly accountName: string;
  readonly debit: string;
  readonly credit: string;
  readonly memo?: string;
}

export interface IJournalEntryDto {
  readonly id: string;
  readonly number: string;
  readonly date: string;
  readonly description: string;
  readonly lines: ReadonlyArray<IJournalLineDto>;
}

export interface IAccountingTxnRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IAccountingSummary {
  readonly cash: string;
  readonly ar: string;
  readonly ap: string;
  readonly pl: string;
}

export interface IWarehouseRow {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly itemCount: number;
}

export interface IStockMovementRow {
  readonly id: string;
  readonly col1: string;
  readonly col2: string;
  readonly col3: string;
  readonly kind: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';
}

export interface IInventoryValuationRow {
  readonly id: string;
  readonly col1: string;
  readonly col2: string;
  readonly col3: string;
}

export interface IPurchaseReturnRow {
  readonly id: string;
  readonly number: string;
  readonly purchase: string;
  readonly date: string;
  readonly amount: string;
}

export interface ISaleReturnRow {
  readonly id: string;
  readonly number: string;
  readonly invoice: string;
  readonly date: string;
  readonly amount: string;
}

export interface ISalePaymentRow {
  readonly id: string;
  readonly ref: string;
  readonly customer: string;
  readonly method: string;
  readonly amount: string;
  readonly date: string;
}

export interface IGoldPurityRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IGoldLotRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IGoldBalanceRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IGoldRateBoardRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IGoldCalculatorResult {
  readonly weight: string;
  readonly purity: string;
  readonly rate: string;
  readonly fee: string;
  readonly goldValue: string;
  readonly total: string;
}

export interface IArtisanRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IProductionBatchRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IOrgUserRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IAuditRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

export interface IOrgProfile {
  readonly id: string;
  readonly name: string;
  readonly taxId: string;
  readonly phone: string;
  readonly address: string;
  readonly slug: string;
}

export interface IOrgSettingSection {
  readonly section: string;
  readonly values: Readonly<Record<string, string>>;
}

export interface IReportSeriesPoint {
  readonly label: string;
  readonly value: number;
}

export interface IReportDto {
  readonly period: string;
  readonly total: string;
  readonly kpis: ReadonlyArray<{ readonly id: string; readonly label: string; readonly value: string }>;
  readonly series: ReadonlyArray<IReportSeriesPoint>;
}

export interface ISearchHit {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly subtitle: string;
  readonly href: string;
}

export interface ISearchResult {
  readonly query: string;
  readonly groups: ReadonlyArray<{
    readonly type: string;
    readonly hits: ReadonlyArray<ISearchHit>;
  }>;
}

export type IntegrationKind = 'device' | 'scale' | 'api' | 'webhook';
export type IntegrationStatus = 'healthy' | 'degraded' | 'offline' | 'unknown';

export interface IIntegrationRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly kind: IntegrationKind;
  readonly status: IntegrationStatus;
}
