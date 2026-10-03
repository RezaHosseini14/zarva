import type {
  IAccountingSummary,
  IAccountingTxnRow,
  ILedgerRow,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getAccountingSummary(): Promise<IAccountingSummary> {
  return serverApiFetch('/accounting/summary');
}

export async function getAccountingLedger(): Promise<ReadonlyArray<ILedgerRow>> {
  return serverApiFetch('/accounting/ledger');
}

export async function getAccountingSection(
  section:
    | 'cash-bank'
    | 'income'
    | 'expenses'
    | 'receivables'
    | 'payables'
    | 'transactions',
): Promise<ReadonlyArray<IAccountingTxnRow>> {
  return serverApiFetch(`/accounting/sections/${section}`);
}
