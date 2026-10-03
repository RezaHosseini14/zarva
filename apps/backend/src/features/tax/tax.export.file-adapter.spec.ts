import { exportTaxFilingCsv, exportTaxFilingXml } from './tax.export.file-adapter';

const input = {
  filingId: 'f1',
  periodLabel: 'Q1',
  kind: 'vat',
  totals: { totalAmountIRT: '1000' },
  lines: [{ label: 'INV-1', amount: '1000' }],
};

describe('tax export adapters', () => {
  it('exports csv', () => {
    const result = exportTaxFilingCsv(input);
    expect(result.format).toBe('csv');
    expect(result.content).toContain('INV-1');
  });

  it('escapes csv special chars', () => {
    const result = exportTaxFilingCsv({
      ...input,
      lines: [{ label: 'a,b', amount: '1' }],
    });
    expect(result.content).toContain('"a,b"');
  });

  it('exports xml', () => {
    const result = exportTaxFilingXml(input);
    expect(result.format).toBe('xml');
    expect(result.content).toContain('<filing');
  });

  it('escapes xml in labels', () => {
    const result = exportTaxFilingXml({
      ...input,
      lines: [{ label: 'a&b', amount: '1' }],
    });
    expect(result.content).toContain('a&amp;b');
  });
});
