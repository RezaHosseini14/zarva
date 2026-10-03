'use client';

import { useTranslations } from 'next-intl';

import { useDisplayPreferences } from '@/features/settings/use-display-preferences';
import { resolveMoneyUnitDisplay } from '@/features/settings/resolve-money-unit';

export function useResolveMoney(): (value: string) => string {
  const t = useTranslations('units');
  const { compactUnits } = useDisplayPreferences();

  return (value: string) =>
    resolveMoneyUnitDisplay(value, compactUnits, t('millionRial'), t('millionRialCompact'));
}
