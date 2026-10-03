import type { ITaxExportResult } from '@zarva/shared';

export interface ITaxFilingExportInput {
  readonly filingId: string;
  readonly periodLabel: string;
  readonly kind: string;
  readonly totals: Readonly<Record<string, number | string>>;
  readonly lines: ReadonlyArray<{ readonly label: string; readonly amount: string }>;
}

export function exportTaxFilingCsv(input: ITaxFilingExportInput): ITaxExportResult {
  const header = 'label,amount';
  const body = input.lines.map((l) => `${escapeCsv(l.label)},${escapeCsv(l.amount)}`).join('\n');
  const totals = Object.entries(input.totals)
    .map(([k, v]) => `total_${k},${String(v)}`)
    .join('\n');
  const content = [header, body, '', 'meta,', `period,${escapeCsv(input.periodLabel)}`, `kind,${escapeCsv(input.kind)}`, totals]
    .filter(Boolean)
    .join('\n');
  return {
    format: 'csv',
    filename: `tax-filing-${input.filingId}.csv`,
    content,
  };
}

export function exportTaxFilingXml(input: ITaxFilingExportInput): ITaxExportResult {
  const lineXml = input.lines
    .map(
      (l) =>
        `    <line><label>${escapeXml(l.label)}</label><amount>${escapeXml(l.amount)}</amount></line>`,
    )
    .join('\n');
  const totalsXml = Object.entries(input.totals)
    .map(([k, v]) => `    <total key="${escapeXml(k)}">${escapeXml(String(v))}</total>`)
    .join('\n');
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<filing id="${escapeXml(input.filingId)}">
  <period>${escapeXml(input.periodLabel)}</period>
  <kind>${escapeXml(input.kind)}</kind>
  <lines>
${lineXml}
  </lines>
  <totals>
${totalsXml}
  </totals>
</filing>`;
  return {
    format: 'xml',
    filename: `tax-filing-${input.filingId}.xml`,
    content,
  };
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
