import type { ISaleInvoiceDetailDto } from '@zarva/shared';

import type { IGoldInvoiceLabels } from './gold-invoice-labels';
import { GoldInvoiceHeader } from './gold-invoice-header';
import { GoldInvoiceLinesTable } from './gold-invoice-lines-table';
import { GoldInvoiceMeta } from './gold-invoice-meta';
import { GoldInvoiceTotals } from './gold-invoice-totals';

export type { IGoldInvoiceLabels } from './gold-invoice-labels';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly labels: IGoldInvoiceLabels;
}

export function GoldInvoiceDocument({ invoice, labels }: IProps) {
  return (
    <article className="gold-invoice-sheet" dir="rtl">
      <GoldInvoiceHeader invoice={invoice} labels={labels} />
      <GoldInvoiceMeta invoice={invoice} labels={labels} />
      <GoldInvoiceLinesTable lines={invoice.lines} labels={labels} />
      <GoldInvoiceTotals totals={invoice.totals} labels={labels} />
      <p className="gi-note">{labels.warranty}</p>
      <footer className="gi-signatures">
        <div className="gi-sign">
          <div className="gi-sign-line" />
          <p className="gi-sign-label">{labels.buyerSign}</p>
        </div>
        <div className="gi-sign">
          <div className="gi-sign-line" />
          <p className="gi-sign-label">{labels.sellerSign}</p>
        </div>
      </footer>
    </article>
  );
}
