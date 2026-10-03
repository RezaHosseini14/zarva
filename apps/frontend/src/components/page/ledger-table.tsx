'use client';

import { MoneyText } from '@/components/business/metrics';

interface ILedgerRow {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly debit: string;
  readonly credit: string;
  readonly balance: string;
}

interface ILedgerTableProps {
  readonly rows: ReadonlyArray<ILedgerRow>;
  readonly openingLabel: string;
  readonly openingValue: string;
  readonly closingLabel: string;
  readonly closingValue: string;
  readonly headers: {
    readonly date: string;
    readonly description: string;
    readonly debit: string;
    readonly credit: string;
    readonly balance: string;
  };
}

export function LedgerTable({
  rows,
  openingLabel,
  openingValue,
  closingLabel,
  closingValue,
  headers,
}: ILedgerTableProps) {
  return (
    <div className="zarva-glass-card">
      <div className="flex justify-between border-b border-border bg-nested px-4 py-3 text-sm">
        <span className="text-muted-fg">{openingLabel}</span>
        <MoneyText value={openingValue} className="zarva-num font-medium" />
      </div>
      <div className="overflow-x-auto zarva-scrollbar">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-muted-fg">
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-start font-medium">{headers.date}</th>
              <th className="px-4 py-2 text-start font-medium">{headers.description}</th>
              <th className="px-4 py-2 text-start font-medium">{headers.debit}</th>
              <th className="px-4 py-2 text-start font-medium">{headers.credit}</th>
              <th className="px-4 py-2 text-start font-medium">{headers.balance}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50">
                <td className="px-4 py-2 tabular-nums text-secondary">{row.date}</td>
                <td className="px-4 py-2">{row.description}</td>
                <td className="px-4 py-2">
                  <MoneyText value={row.debit} className="tabular-nums" />
                </td>
                <td className="px-4 py-2">
                  <MoneyText value={row.credit} className="tabular-nums" />
                </td>
                <td className="px-4 py-2">
                  <MoneyText value={row.balance} className="font-medium tabular-nums" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between border-t border-border bg-nested px-4 py-3 text-sm">
        <span className="text-muted-fg">{closingLabel}</span>
        <MoneyText value={closingValue} className="zarva-num font-semibold text-primary" />
      </div>
    </div>
  );
}

export type { ILedgerRow };
