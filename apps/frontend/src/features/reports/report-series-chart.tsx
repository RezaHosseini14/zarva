'use client';

import { useId, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { IReportSeriesPoint } from '@zarva/shared';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '@/components/page/empty-state';

interface IProps {
  readonly series: ReadonlyArray<IReportSeriesPoint>;
}

interface IChartRow {
  readonly label: string;
  readonly fullLabel: string;
  readonly value: number;
}

export function ReportSeriesChart({ series }: IProps) {
  const t = useTranslations('modules.reports');
  const gid = useId().replace(/:/g, '');
  const data = useMemo(
    () =>
      series.slice(0, 10).map(
        (p): IChartRow => ({
          label: shortenLabel(p.label),
          fullLabel: p.label,
          value: p.value,
        }),
      ),
    [series],
  );

  if (data.length === 0) {
    return (
      <EmptyState
        className="min-h-0 flex-1"
        icon="chart-bold"
        accent="bg-info/15 text-info ring-info/25"
        title={t('chartEmpty')}
        description={t('chartEmptyDesc')}
      />
    );
  }

  return (
    <div className="relative -mb-4 -mr-4 min-h-0 flex-1 sm:-mb-5 sm:-mr-5">
      <div className="absolute inset-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 14, right: 4, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`reportBar-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-highlight)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 8"
            vertical={false}
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tickMargin={10}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
          />
          <YAxis
            width={52}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickCount={5}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
            tickFormatter={formatAxis}
          />
          <Tooltip
            cursor={{ fill: 'var(--primary)', fillOpacity: 0.08 }}
            contentStyle={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
              color: 'var(--foreground)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--foreground-secondary)' }}
            itemStyle={{ color: 'var(--primary-highlight)' }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as IChartRow | undefined;
              return row?.fullLabel ?? '';
            }}
            formatter={(value: number) => [formatAxis(value), t('seriesValue')]}
          />
          <Bar
            dataKey="value"
            fill={`url(#reportBar-${gid})`}
            radius={[10, 10, 4, 4]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

function shortenLabel(label: string): string {
  if (label.length <= 8) return label;
  return `${label.slice(0, 7)}…`;
}

function formatAxis(value: number): string {
  const n = Math.round(Math.abs(value));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
}
