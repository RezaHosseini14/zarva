export type GoldLedgerSourceType =
  | 'sale'
  | 'buyback'
  | 'purchase'
  | 'adjust'
  | 'reversal';

export type GoldLedgerDirection = 'in' | 'out';

export interface IGoldLedgerLine {
  readonly grams: number;
  readonly purityKarat: number;
  readonly rateIrt: number;
  readonly counterparty: string;
}

export interface IGoldLockedRate {
  readonly id: string;
  readonly businessDate: string;
  readonly buyRateIrt: number;
  readonly sellRateIrt: number;
  readonly lockedAt: string;
  readonly label: string;
}

export interface ILockGoldRateRequest {
  readonly businessDate: string;
  readonly buyRateIrt: number;
  readonly sellRateIrt: number;
  readonly label?: string;
}

export interface ICorrectGoldRateRequest {
  readonly businessDate: string;
  readonly buyRateIrt: number;
  readonly sellRateIrt: number;
  readonly reason: string;
}

export interface IGoldRateCorrection {
  readonly id: string;
  readonly businessDate: string;
  readonly prevBuyRateIrt: number;
  readonly prevSellRateIrt: number;
  readonly nextBuyRateIrt: number;
  readonly nextSellRateIrt: number;
  readonly reason: string;
  readonly correctedByUserId: string | null;
  readonly createdAt: string;
}

export interface IGoldAdjustRequest {
  readonly grams: number;
  readonly purityKarat: number;
  readonly direction: GoldLedgerDirection;
  readonly reason: string;
  readonly displayDate?: string;
  readonly rateIrt?: number;
}

export interface IDayCloseMetalByKarat {
  readonly purityKarat: number;
  readonly gramsIn: number;
  readonly gramsOut: number;
  readonly closingGrams: number;
}

export interface IDayCloseSummary {
  readonly businessDate: string;
  readonly salesCount: number;
  readonly buybacksCount: number;
  readonly purchasesCount: number;
  readonly salesAmountIrt: number;
  readonly buybacksAmountIrt: number;
  readonly purchasesAmountIrt: number;
  readonly cashInIrt: number;
  readonly cashOutIrt: number;
  readonly metal: ReadonlyArray<IDayCloseMetalByKarat>;
  readonly closedAt: string | null;
}

export const ORG_GOLD_STOCK_PARTY = 'ORG';

export const BUSINESS_TZ = 'Asia/Tehran';

const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const tehranDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function fineGramsFromKarat(grams: number, purityKarat: number): number {
  return Math.round(((grams * purityKarat) / 24) * 1000) / 1000;
}

/** Calendar YYYY-MM-DD in Asia/Tehran (not UTC). */
export function businessDateKey(date: Date | string = new Date()): string {
  if (typeof date === 'string') {
    return assertBusinessDateString(date.slice(0, 10));
  }
  return tehranDateFormatter.format(date);
}

export function assertBusinessDateString(value: string): string {
  const key = value.trim().slice(0, 10);
  if (!BUSINESS_DATE_RE.test(key)) {
    throw new Error(`Invalid business date: ${value}`);
  }
  return key;
}
