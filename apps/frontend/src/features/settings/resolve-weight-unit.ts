/** Known weight / rate suffixes (longest first). */
const WEIGHT_UNIT_SUFFIXES = [
  'م/گرم',
  'م/غرام',
  'م/g',
  'M/g',
  'گرم',
  'غرام',
  'gram',
  'grams',
  'g',
] as const;

type WeightSuffixKind = 'gram' | 'millionPerGram';

interface IStripWeightResult {
  readonly amount: string;
  readonly kind: WeightSuffixKind;
}

const AMOUNT_RE = /^[+\u2212\-]?\s*[\d۰-۹٠-٩٫.,]+$/u;

function endsWithUnit(value: string, suffix: string): boolean {
  if (value.endsWith(suffix)) return true;
  if (/^[A-Za-z\s/]+$/.test(suffix)) {
    return value.toLowerCase().endsWith(suffix.toLowerCase());
  }
  return false;
}

function kindForSuffix(suffix: string): WeightSuffixKind {
  if (suffix === 'م/گرم' || suffix === 'م/غرام' || suffix === 'م/g' || suffix === 'M/g') {
    return 'millionPerGram';
  }
  return 'gram';
}

export function stripWeightUnit(value: string): IStripWeightResult | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;

  for (const suffix of WEIGHT_UNIT_SUFFIXES) {
    if (trimmed.length <= suffix.length) continue;
    if (!endsWithUnit(trimmed, suffix)) continue;
    const before = trimmed.slice(0, -suffix.length).trimEnd();
    if (!AMOUNT_RE.test(before)) continue;
    return { amount: before, kind: kindForSuffix(suffix) };
  }

  return null;
}

export function resolveWeightUnitDisplay(
  value: string,
  compactUnits: boolean,
  labels: {
    readonly gram: string;
    readonly gramCompact: string;
    readonly millionPerGram: string;
    readonly millionPerGramCompact: string;
  },
): string {
  const parsed = stripWeightUnit(value);
  if (parsed === null) return value;

  const unit =
    parsed.kind === 'millionPerGram'
      ? compactUnits
        ? labels.millionPerGramCompact
        : labels.millionPerGram
      : compactUnits
        ? labels.gramCompact
        : labels.gram;

  return `${parsed.amount} ${unit}`;
}
