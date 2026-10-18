'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { IDashboardOverview } from '@zarva/shared';

import { KpiGrid } from '@/components/page/kpi-grid';
import { ActivityList } from '@/features/dashboard/activity-list';
import { ForecastChart } from '@/features/dashboard/forecast-chart';
import { formatKpiDelta, formatKpiValue } from '@/features/dashboard/kpi-format';
import { useDisplayPreferences } from '@/features/settings/use-display-preferences';

interface IDashboardOverviewPanelProps {
  readonly overview: IDashboardOverview;
  readonly aiSlot: ReactNode;
}

export function DashboardOverviewPanel({
  overview,
  aiSlot,
}: IDashboardOverviewPanelProps) {
  const t = useTranslations('dashboard');
  const tu = useTranslations('units');
  const locale = useLocale();
  const { compactUnits } = useDisplayPreferences();

  const labelFor = (labelKey: string) => {
    if (labelKey.includes('salesToday')) return t('kpi.salesToday');
    if (labelKey.includes('goldStock')) return t('kpi.goldStock');
    if (labelKey.includes('customers')) return t('kpi.customers');
    if (labelKey.includes('cashInToday')) return t('kpi.cashInToday');
    return t('kpi.margin');
  };

  const unitLabelFor = (unit: IDashboardOverview['kpis'][number]['unit']) => {
    if (unit === 'million') {
      return compactUnits ? tu('millionRialCompact') : tu('millionRial');
    }
    if (unit === 'kg') {
      return compactUnits ? tu('kgCompact') : tu('kg');
    }
    return '';
  };

  const iconFor = (labelKey: string) => {
    if (labelKey.includes('salesToday')) {
      return {
        icon: 'cart-large-2-bold' as const,
        accent: 'bg-success/15 text-success ring-success/25',
      };
    }
    if (labelKey.includes('goldStock')) {
      return {
        icon: 'crown-star-bold' as const,
        accent: 'bg-primary/15 text-primary ring-primary/25',
      };
    }
    if (labelKey.includes('customers')) {
      return {
        icon: 'users-group-rounded-bold' as const,
        accent: 'bg-info/15 text-info ring-info/25',
      };
    }
    if (labelKey.includes('cashInToday')) {
      return {
        icon: 'wallet-money-bold' as const,
        accent: 'bg-success/15 text-success ring-success/25',
      };
    }
    return {
      icon: 'chart-bold' as const,
      accent: 'bg-warning/15 text-warning ring-warning/25',
    };
  };

  return (
    <>
      <KpiGrid
        className="mb-4"
        items={overview.kpis.map((kpi) => {
          const visual = iconFor(kpi.labelKey);
          return {
            id: kpi.id,
            label: labelFor(kpi.labelKey),
            value: formatKpiValue({
              value: kpi.value,
              unit: kpi.unit,
              locale,
              unitLabel: unitLabelFor(kpi.unit),
            }),
            hint: formatKpiDelta({
              delta: kpi.delta,
              deltaUnit: kpi.deltaUnit,
              locale,
            }),
            tone: kpi.trend === 'up' ? 'up' : kpi.trend === 'down' ? 'down' : 'default',
            icon: visual.icon,
            accent: visual.accent,
          };
        })}
      />
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="min-h-[22rem] lg:col-span-2 sm:min-h-[24rem]">
          <ForecastChart data={overview.forecast} title={t('forecast')} />
        </div>
        {aiSlot}
      </div>
      <div className="mt-4">
        <ActivityList
          title={t('activity')}
          emptyTitle={t('activityEmptyTitle')}
          emptyDescription={t('activityEmptyDescription')}
          items={overview.activity.map((a) => {
            if (a.titleKey.includes('buyback')) {
              return {
                id: a.id,
                title: t('activityItems.buybackCompleted'),
                time: a.time,
                icon: 'hand-money-bold' as const,
                accent: 'bg-warning/15 text-warning ring-warning/25',
              };
            }
            if (a.titleKey.includes('sale')) {
              return {
                id: a.id,
                title: t('activityItems.saleCompleted'),
                time: a.time,
                icon: 'cart-large-2-bold' as const,
                accent: 'bg-success/15 text-success ring-success/25',
              };
            }
            if (a.titleKey.includes('purchase')) {
              return {
                id: a.id,
                title: t('activityItems.purchaseReceived'),
                time: a.time,
                icon: 'delivery-bold' as const,
                accent: 'bg-primary/15 text-primary ring-primary/25',
              };
            }
            return {
              id: a.id,
              title: t('activityItems.stockAdjust'),
              time: a.time,
              icon: 'box-bold' as const,
              accent: 'bg-warning/15 text-warning ring-warning/25',
            };
          })}
        />
      </div>
    </>
  );
}
