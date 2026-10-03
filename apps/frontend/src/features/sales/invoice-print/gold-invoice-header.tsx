import type { ISaleInvoiceDetailDto } from '@zarva/shared';

import type { IGoldInvoiceLabels } from './gold-invoice-labels';

interface IProps {
  readonly invoice: ISaleInvoiceDetailDto;
  readonly labels: Pick<IGoldInvoiceLabels, 'shopPhone' | 'guildId' | 'documentTitle'>;
}

export function GoldInvoiceHeader({ invoice, labels }: IProps) {
  const { shop } = invoice;

  return (
    <header className="gi-header">
      <p className="gi-header-ornament">◆ ◆ ◆</p>
      <h1 className="gi-shop-name">{shop.name}</h1>
      <div className="gi-shop-meta">
        <p>{shop.address}</p>
        <p>
          {labels.shopPhone}: {shop.phone} · {labels.guildId}: {shop.guildId}
        </p>
      </div>
      <div className="gi-title-row">
        <span className="gi-title">{labels.documentTitle}</span>
      </div>
    </header>
  );
}
