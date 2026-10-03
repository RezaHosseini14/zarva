import type { ISaleInvoiceLineDto } from '@zarva/shared';

import type { IGoldInvoiceLabels } from './gold-invoice-labels';

interface IProps {
  readonly lines: ReadonlyArray<ISaleInvoiceLineDto>;
  readonly labels: Pick<
    IGoldInvoiceLabels,
    | 'row'
    | 'description'
    | 'weight'
    | 'purity'
    | 'dailyRate'
    | 'goldValue'
    | 'wage'
    | 'profit'
    | 'tax'
    | 'lineTotal'
  >;
}

export function GoldInvoiceLinesTable({ lines, labels }: IProps) {
  return (
    <div className="gi-table-wrap">
      <table className="gi-table">
        <thead>
          <tr>
            <th>{labels.row}</th>
            <th>{labels.description}</th>
            <th>{labels.weight}</th>
            <th>{labels.purity}</th>
            <th>{labels.dailyRate}</th>
            <th>{labels.goldValue}</th>
            <th>{labels.wage}</th>
            <th>{labels.profit}</th>
            <th>{labels.tax}</th>
            <th>{labels.lineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={line.id}>
              <td className="gi-num">{index + 1}</td>
              <td className="gi-desc">{line.description}</td>
              <td className="gi-num">{line.weight}</td>
              <td className="gi-num">{line.purity}</td>
              <td className="gi-num">{line.dailyRate}</td>
              <td className="gi-num">{line.goldValue}</td>
              <td className="gi-num">{line.wage}</td>
              <td className="gi-num">{line.profit}</td>
              <td className="gi-num">{line.tax}</td>
              <td className="gi-num">{line.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
