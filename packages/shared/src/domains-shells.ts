/** DTOs for formerly-shell domains: branches, commerce, tax, jewelry, AI, integrations hub. */

export interface IBranchRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly code: string;
  readonly city: string;
  readonly isActive: boolean;
  readonly userCount: number;
}

export interface ICommerceChannelRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly type: string;
  readonly status: string;
  readonly listingCount: number;
}

export interface ICommerceListingRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly channelId: string;
  readonly inventoryItemId: string;
  readonly status: string;
}

export interface ICommerceSummary {
  readonly channels: number;
  readonly listings: number;
  readonly activeChannels: number;
}

export type TaxPeriodStatus = 'open' | 'closed';
export type TaxFilingStatus = 'draft' | 'ready' | 'exported' | 'submitted';
export type TaxFilingKind = 'vat' | 'seasonal' | 'other';

export interface ITaxPeriodRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly from: string;
  readonly to: string;
  readonly status: TaxPeriodStatus;
}

export interface ITaxFilingRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly periodId: string;
  readonly kind: TaxFilingKind;
  readonly status: TaxFilingStatus;
  readonly totals: Readonly<Record<string, number | string>>;
}

export interface ITaxExportResult {
  readonly format: 'xml' | 'csv';
  readonly filename: string;
  readonly content: string;
}

export type JewelryPieceStatus = 'showcase' | 'reserved' | 'sold' | 'workshop';

export interface IJewelryPieceRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly sku: string;
  readonly status: JewelryPieceStatus;
  readonly weight: string;
  readonly purity: string;
  readonly inventoryItemId: string | null;
}

export interface IJewelryBomLineRow {
  readonly id: string;
  readonly componentType: string;
  readonly description: string;
  readonly weight: string;
  readonly carat: string;
  readonly qty: number;
}

export interface IJewelryReservationRow {
  readonly id: string;
  readonly pieceId: string;
  readonly customerId: string | null;
  readonly reservedUntil: string;
  readonly status: string;
}

export type AiInsightSource = 'rules' | 'llm';
export type AiInsightSeverity = 'info' | 'warning' | 'critical';

export interface IAiInsightRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly code: string;
  readonly severity: AiInsightSeverity;
  readonly source: AiInsightSource;
  readonly createdAt: string;
}

export interface IAiCapabilities {
  readonly rules: boolean;
  readonly summarize: boolean;
}

export interface IAiSummarizeResult {
  readonly text: string;
  readonly model: string;
}

export interface IIntegrationsSummary {
  readonly total: number;
  readonly healthy: number;
  readonly degraded: number;
  readonly offline: number;
  readonly apiKeys: number;
  readonly byKind: ReadonlyArray<{ readonly kind: string; readonly count: number }>;
}
