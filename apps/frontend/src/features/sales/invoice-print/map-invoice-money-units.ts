import type { ISaleInvoiceDetailDto } from '@zarva/shared';

export function mapInvoiceMoneyUnits(
  invoice: ISaleInvoiceDetailDto,
  resolve: (value: string) => string,
): ISaleInvoiceDetailDto {
  return {
    ...invoice,
    amount: resolve(invoice.amount),
    lines: invoice.lines.map((line) => ({
      ...line,
      dailyRate: resolve(line.dailyRate),
      goldValue: resolve(line.goldValue),
      wage: resolve(line.wage),
      profit: resolve(line.profit),
      tax: resolve(line.tax),
      lineTotal: resolve(line.lineTotal),
    })),
    totals: {
      ...invoice.totals,
      goldValue: resolve(invoice.totals.goldValue),
      wage: resolve(invoice.totals.wage),
      profit: resolve(invoice.totals.profit),
      tax: resolve(invoice.totals.tax),
      grandTotal: resolve(invoice.totals.grandTotal),
    },
  };
}
