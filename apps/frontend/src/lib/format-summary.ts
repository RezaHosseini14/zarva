/** Locale-neutral numeric labels for list KPI grids (server + client safe). */
export function formatSummaryNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits > 0 ? Math.min(fractionDigits, 3) : 0,
  });
}
