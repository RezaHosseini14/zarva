import type {
  IGoldBalanceRow,
  IGoldCalculatorResult,
  IGoldLedgerEntry,
  IGoldLotRow,
  IGoldPurityRow,
  IGoldRateBoardRow,
  IGoldSummary,
  IGoldTxnRow,
  ILedgerRow,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

interface IGoldSectionRow {
  readonly id: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
}

function mapAbcRows(
  rows: ReadonlyArray<{ readonly id: string; readonly a: string; readonly b: string; readonly c: string }>,
): ReadonlyArray<IGoldSectionRow> {
  return rows.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }));
}

function mapTxnRows(rows: ReadonlyArray<IGoldTxnRow>): ReadonlyArray<IGoldSectionRow> {
  return rows.map((r) => ({
    id: r.id,
    a: r.type,
    b: r.weight,
    c: r.purity,
  }));
}

export async function getGoldSummary(): Promise<IGoldSummary> {
  return serverApiFetch('/gold/summary');
}

export async function getGoldLedger(): Promise<ReadonlyArray<ILedgerRow>> {
  const rows = await serverApiFetch<ReadonlyArray<IGoldLedgerEntry>>('/gold/ledger');
  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    description: r.description,
    debit: r.debit,
    credit: r.credit,
    balance: r.balance,
  }));
}

export async function getGoldTransactions(): Promise<ReadonlyArray<IGoldTxnRow>> {
  return serverApiFetch('/gold/transactions');
}

export async function getGoldTransactionSectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapTxnRows(await getGoldTransactions());
}

export async function getGoldBalance(): Promise<ReadonlyArray<IGoldBalanceRow>> {
  return serverApiFetch('/gold/balance');
}

export async function getGoldBalances(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldBalance());
}

export async function getGoldRates(): Promise<ReadonlyArray<IGoldRateBoardRow>> {
  return serverApiFetch('/gold/rates');
}

export async function getGoldRateSectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldRates());
}

export async function getGoldPurities(): Promise<ReadonlyArray<IGoldPurityRow>> {
  return serverApiFetch('/gold/purities');
}

export async function getGoldPuritySectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldPurities());
}

export async function getGoldLots(): Promise<ReadonlyArray<IGoldLotRow>> {
  return serverApiFetch('/gold/lots');
}

export async function getGoldLotSectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldLots());
}

export async function getGoldMelted(): Promise<ReadonlyArray<IGoldBalanceRow>> {
  return serverApiFetch('/gold/melted');
}

export async function getGoldMeltedSectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldMelted());
}

export async function getGoldRaw(): Promise<ReadonlyArray<IGoldBalanceRow>> {
  return serverApiFetch('/gold/raw');
}

export async function getGoldRawSectionRows(): Promise<ReadonlyArray<IGoldSectionRow>> {
  return mapAbcRows(await getGoldRaw());
}

export async function postGoldCalculator(body: {
  readonly weight: number;
  readonly purity: number;
  readonly rate: number;
  readonly fee?: number;
}): Promise<IGoldCalculatorResult> {
  return serverApiFetch('/gold/calculator', { method: 'POST', body });
}

