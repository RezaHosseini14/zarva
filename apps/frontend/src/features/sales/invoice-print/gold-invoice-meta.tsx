import type { ISaleInvoiceDetailDto } from '@zarva/shared';

import type { IGoldInvoiceLabels } from './gold-invoice-labels';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly labels: Pick<
    IGoldInvoiceLabels,
    'invoiceNumber' | 'date' | 'customer' | 'phone' | 'nationalId' | 'seller'
  >;
}

export function GoldInvoiceMeta({ invoice, labels }: IProps) {
  const { customerDetail } = invoice;

  return (
    <dl className="gi-meta-grid">
      <div className="gi-meta-item">
        <dt>{labels.invoiceNumber}:</dt>
        <dd>{invoice.number}</dd>
      </div>
      <div className="gi-meta-item">
        <dt>{labels.date}:</dt>
        <dd>{invoice.date}</dd>
      </div>
      <div className="gi-meta-item">
        <dt>{labels.customer}:</dt>
        <dd>{customerDetail.name}</dd>
      </div>
      <div className="gi-meta-item">
        <dt>{labels.seller}:</dt>
        <dd>{invoice.seller}</dd>
      </div>
      <div className="gi-meta-item">
        <dt>{labels.phone}:</dt>
        <dd className="gi-num">{customerDetail.phone}</dd>
      </div>
      <div className="gi-meta-item">
        <dt>{labels.nationalId}:</dt>
        <dd className="gi-num">{customerDetail.nationalId}</dd>
      </div>
    </dl>
  );
}
