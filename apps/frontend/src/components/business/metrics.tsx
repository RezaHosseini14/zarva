'use client';

import { useResolveMoney } from '@/features/settings/use-resolve-money';
import { useWeightUnitLabel } from '@/features/settings/use-resolve-weight';

interface IMoneyTextProps {
  readonly value: string;
  readonly className?: string;
}

export function MoneyText({ value, className }: IMoneyTextProps) {
  const resolve = useResolveMoney();
  return <span className={className ?? 'font-medium tabular-nums'}>{resolve(value)}</span>;
}

interface IWeightTextProps {
  readonly grams: string;
  readonly className?: string;
}

export function WeightText({ grams, className }: IWeightTextProps) {
  const unitLabel = useWeightUnitLabel();
  return (
    <span className={className ?? 'tabular-nums text-primary'}>
      {grams} <span className="text-xs text-muted-fg">{unitLabel}</span>
    </span>
  );
}
