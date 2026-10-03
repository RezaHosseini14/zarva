'use client';

import type { ISaleInvoiceDetailDto } from '@zarva/shared';

import { GoldInvoicePrintPage } from '@/features/sales/invoice-print/gold-invoice-print-page';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly autoPrint: boolean;
}

export function PrintAutoFlag({ invoice, autoPrint }: IProps) {
  return <GoldInvoicePrintPage invoice={invoice} autoPrint={autoPrint} />;
}
