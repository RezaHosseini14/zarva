'use server';

import type {
  ICreateSaleInvoiceRequest,
  ISaleCheckoutRequest,
  ISaleCheckoutResult,
  ISaleInvoice,
  ISalePaymentRow,
  SaleDocumentKind,
} from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type SaleActionResult =
  | { readonly ok: true; readonly invoice: ISaleInvoice }
  | { readonly ok: false; readonly error: string };

export type SaleCheckoutActionResult =
  | { readonly ok: true; readonly result: ISaleCheckoutResult }
  | { readonly ok: false; readonly error: string };

export type SalePaymentActionResult =
  | { readonly ok: true; readonly payment: ISalePaymentRow }
  | { readonly ok: false; readonly error: string };

export async function createSaleInvoiceAction(
  input: ICreateSaleInvoiceRequest,
): Promise<SaleActionResult> {
  try {
    const invoice = await serverApiFetch<ISaleInvoice>('/sales/invoices', {
      method: 'POST',
      body: input,
    });
    return { ok: true, invoice };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Create sale failed' };
  }
}

export async function checkoutSaleAction(
  input: ISaleCheckoutRequest,
): Promise<SaleCheckoutActionResult> {
  try {
    const result = await serverApiFetch<ISaleCheckoutResult>('/sales/checkout', {
      method: 'POST',
      body: input,
    });
    return { ok: true, result };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Checkout failed' };
  }
}

export async function addSalePaymentAction(input: {
  readonly invoiceId: string;
  readonly ref: string;
  readonly method: string;
  readonly amountIrt: number;
  readonly displayDate?: string;
}): Promise<SalePaymentActionResult> {
  try {
    const payment = await serverApiFetch<ISalePaymentRow>('/sales/payments', {
      method: 'POST',
      body: input,
    });
    return { ok: true, payment };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Payment failed' };
  }
}

export type { SaleDocumentKind };
