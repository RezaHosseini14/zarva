import type { ISaleInvoiceTotalsDto } from '@zarva/shared';

import type { IGoldInvoiceLabels } from './gold-invoice-labels';

interface IProps {
  readonly totals: ISaleInvoiceTotalsDto;
  readonly labels: Pick<
    IGoldInvoiceLabels,
    'totalWeight' | 'goldValue' | 'wage' | 'profit' | 'tax' | 'grandTotal' | 'amountInWords' | 'grams'
  >;
}

export function GoldInvoiceTotals({ totals, labels }: IProps) {
  return (
    <section className="gi-totals">
      <div className="gi-totals-box">
        <dl>
          <dt>{labels.totalWeight}</dt>
          <dd>
            {totals.totalWeight} {labels.grams}
          </dd>
        </dl>
        <dl>
          <dt>{labels.goldValue}</dt>
          <dd>{totals.goldValue}</dd>
        </dl>
        <dl>
          <dt>{labels.wage}</dt>
          <dd>{totals.wage}</dd>
        </dl>
      </div>
      <div className="gi-totals-box">
        <dl>
          <dt>{labels.profit}</dt>
          <dd>{totals.profit}</dd>
        </dl>
        <dl>
          <dt>{labels.tax}</dt>
          <dd>{totals.tax}</dd>
        </dl>
      </div>
      <div className="gi-grand">
        <p className="gi-grand-label">{labels.grandTotal}</p>
        <p className="gi-grand-value">{totals.grandTotal}</p>
        <p className="gi-words">
          {labels.amountInWords}: {totals.amountInWords}
        </p>
      </div>
    </section>
  );
}
