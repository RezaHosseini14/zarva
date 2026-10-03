import type { DashboardKpiDeltaUnit, DashboardKpiUnit } from '@zarva/shared';

interface IFormatKpiValueParams {
  readonly value: number;
  readonly unit: DashboardKpiUnit;
  readonly locale: string;
  readonly unitLabel: string;
}

interface IFormatKpiDeltaParams {
  readonly delta: number;
  readonly deltaUnit: DashboardKpiDeltaUnit;
  readonly locale: string;
}

export function formatKpiValue({
  value,
  unit,
  locale,
  unitLabel,
}: IFormatKpiValueParams): string {
  if (unit === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(value / 100);
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === 'count' ? 0 : 1,
    minimumFractionDigits: unit === 'count' ? 0 : 1,
  }).format(value);

  if (unit === 'count') {
    return formatted;
  }

  // Compact Latin abbreviations (e.g. single-letter "M") sit flush; otherwise space.
  if (unitLabel.length <= 1) {
    return `${formatted}${unitLabel}`;
  }

  return `${formatted} ${unitLabel}`;
}

export function formatKpiDelta({ delta, deltaUnit, locale }: IFormatKpiDeltaParams): string {
  if (deltaUnit === 'percent') {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      signDisplay: 'exceptZero',
      maximumFractionDigits: 1,
    }).format(delta / 100);
  }

  return new Intl.NumberFormat(locale, {
    signDisplay: 'exceptZero',
    maximumFractionDigits: 0,
  }).format(delta);
}
