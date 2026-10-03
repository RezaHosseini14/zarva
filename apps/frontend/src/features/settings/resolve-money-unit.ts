/** Known million-rial suffixes (longest first). Mock data uses these compact forms. */
const MONEY_UNIT_SUFFIXES = [
  'میلیون ریال',
  'مليون ريال',
  'million rials',
  'م.ریال',
  'م.ريال',
  'م.ر',
  'M IRR',
  'M',
  'م',
] as const;

const AMOUNT_RE = /^[+\u2212\-]?\s*[\d۰-۹٠-٩٫.,]+$/u;

function endsWithUnit(value: string, suffix: string): boolean {
  if (value.endsWith(suffix)) return true;
  if (/^[A-Za-z\s]+$/.test(suffix)) {
    return value.toLowerCase().endsWith(suffix.toLowerCase());
  }
  return false;
}

export function stripMoneyUnit(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;

  for (const suffix of MONEY_UNIT_SUFFIXES) {
    if (trimmed.length <= suffix.length) continue;
    if (!endsWithUnit(trimmed, suffix)) continue;
    const before = trimmed.slice(0, -suffix.length).trimEnd();
    if (!AMOUNT_RE.test(before)) continue;
    return before;
  }

  return null;
}

export function resolveMoneyUnitDisplay(
  value: string,
  compactUnits: boolean,
  fullUnit: string,
  compactUnit: string,
): string {
  const amount = stripMoneyUnit(value);
  if (amount === null) return value;
  return `${amount} ${compactUnits ? compactUnit : fullUnit}`;
}
