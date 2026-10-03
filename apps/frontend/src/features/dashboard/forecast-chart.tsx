'use client';

import { useTranslations } from 'next-intl';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DashboardPanel } from './dashboard-panel';

interface IForecastPoint {
  readonly label: string;
  readonly value: number;
}

interface IForecastChartProps {
  readonly data: ReadonlyArray<IForecastPoint>;
  readonly title: string;
}

const WEEKDAY_KEYS = new Set([
  'sat',
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
]);

export function ForecastChart({ data, title }: IForecastChartProps) {
  const t = useTranslations('dashboard');

  const chartData = data.map((point) => ({
    ...point,
    label: WEEKDAY_KEYS.has(point.label)
      ? t(`weekdays.${point.label}` as 'weekdays.sat')
      : point.label,
  }));

  return (
    <DashboardPanel
      title={title}
      icon="chart-bold"
      accent="bg-primary/15 text-primary ring-primary/25"
      className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
      headerClassName="shrink-0"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      {/* Bleed bottom + right only — left Y-axis stays inside overflow:hidden */}
      <div className="relative -mb-4 -mr-4 min-h-0 flex-1 sm:-mb-5 sm:-mr-5">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 14, right: 4, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                  <stop offset="45%" stopColor="var(--primary)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary-dark)" />
                  <stop offset="50%" stopColor="var(--primary-highlight)" />
                  <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="4 8"
                vertical={false}
                strokeOpacity={0.55}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={10}
                tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
                padding={{ left: 4, right: 4 }}
              />
              <YAxis
                width={40}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickCount={5}
                tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
              />
              <Tooltip
                cursor={{
                  stroke: 'var(--primary)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                  strokeOpacity: 0.45,
                }}
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
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#goldStroke)"
                strokeWidth={2.75}
                fill="url(#goldFill)"
                filter="url(#goldGlow)"
                activeDot={{
                  r: 5,
                  fill: 'var(--primary-highlight)',
                  stroke: 'var(--elevated)',
                  strokeWidth: 2,
                }}
                dot={{
                  r: 3,
                  fill: 'var(--primary)',
                  stroke: 'var(--elevated)',
                  strokeWidth: 1.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardPanel>
  );
}
