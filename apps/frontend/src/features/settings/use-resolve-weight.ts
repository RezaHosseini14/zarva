'use client';

import { useTranslations } from 'next-intl';

import { useDisplayPreferences } from '@/features/settings/use-display-preferences';
import { resolveWeightUnitDisplay } from '@/features/settings/resolve-weight-unit';

export function useResolveWeight(): (value: string) => string {
  const t = useTranslations('units');
  const { compactUnits } = useDisplayPreferences();

  return (value: string) =>
    resolveWeightUnitDisplay(value, compactUnits, {
      gram: t('gram'),
      gramCompact: t('gramCompact'),
      millionPerGram: t('millionPerGram'),
      millionPerGramCompact: t('millionPerGramCompact'),
    });
}

export function useWeightUnitLabel(): string {
  const t = useTranslations('units');
  const { compactUnits } = useDisplayPreferences();
  return compactUnits ? t('gramCompact') : t('gram');
}
