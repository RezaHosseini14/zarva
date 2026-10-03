'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { IPlatformOrganizationSummary, IPlanWithPrices } from '@zarva/shared';
import { THEME_PRESETS } from '@zarva/shared';

import { DomainListPage } from '@/components/page/domain-list-page';
import { StatusBadge } from '@/components/page/status-badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  assignOrgSubscriptionAction,
  assignOrgThemeAction,
  setOrgSecurityPolicyAction,
} from '@/features/platform/platform-actions';

interface IPlatformOrgsPanelProps {
  readonly organizations: ReadonlyArray<IPlatformOrganizationSummary>;
  readonly plans: ReadonlyArray<IPlanWithPrices>;
}

function statusTone(
  status: string | undefined,
): 'gold' | 'success' | 'warning' | 'neutral' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'trialing') return 'gold';
  if (status === 'past_due') return 'warning';
  if (status === 'expired' || status === 'canceled') return 'danger';
  return 'neutral';
}

function statusIcon(
  status: string | undefined,
): 'check-read-bold' | 'crown-star-bold' | 'bell-bing-bold' | 'danger-triangle-bold' | 'notes-bold' {
  if (status === 'active') return 'check-read-bold';
  if (status === 'trialing') return 'crown-star-bold';
  if (status === 'past_due') return 'bell-bing-bold';
  if (status === 'expired' || status === 'canceled') return 'danger-triangle-bold';
  return 'notes-bold';
}

export function PlatformOrgsPanel({ organizations, plans }: IPlatformOrgsPanelProps) {
  const t = useTranslations('platform');
  const tBilling = useTranslations('billing');
  const tCommon = useTranslations('common');
  const [selectedId, setSelectedId] = useState<string>(organizations[0]?.id ?? '');
  const [planId, setPlanId] = useState<string>(
    plans.find((p) => p.code === 'starter')?.id ?? plans[0]?.id ?? '',
  );
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [months, setMonths] = useState(1);
  const [themePreset, setThemePreset] = useState<string>(
    organizations[0]?.themePreset ?? 'zarva-gold',
  );
  const [maxDevices, setMaxDevices] = useState<string>('');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  const selected = useMemo(
    () => organizations.find((o) => o.id === selectedId) ?? null,
    [organizations, selectedId],
  );

  const sellablePlans = plans.filter((p) => p.code !== 'trial');
  const activeCount = organizations.filter((o) => o.subscription?.status === 'active').length;
  const expiringSoon = organizations.filter((o) => {
    if (!o.subscription?.currentPeriodEnd) return false;
    const end = new Date(o.subscription.currentPeriodEnd).getTime();
    const week = nowMs + 7 * 86_400_000;
    return end <= week && end >= nowMs;
  }).length;

  const saveSubscription = () => {
    if (!selectedId || !planId) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await assignOrgSubscriptionAction(selectedId, {
        planId,
        interval,
        months: interval === 'month' ? months : undefined,
        years: interval === 'year' ? months : undefined,
        status: 'active',
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(t('subSaved'));
    });
  };

  const saveTheme = () => {
    if (!selectedId) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await assignOrgThemeAction(selectedId, themePreset);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(t('themeSaved'));
    });
  };

  const saveSecurityPolicy = () => {
    if (!selectedId) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const parsed = maxDevices.trim() === '' ? null : Number(maxDevices);
      const value =
        parsed == null || !Number.isFinite(parsed) || parsed <= 0 ? null : Math.floor(parsed);
      const result = await setOrgSecurityPolicyAction(selectedId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(t('policySaved'));
    });
  };

  return (
    <DomainListPage
      chrome="body"
      shellTitle={t('title')}
      title={t('title')}
      description={t('description')}
      kpis={[
        {
          id: 'orgs',
          label: t('kpiOrgs'),
          value: String(organizations.length),
          icon: 'buildings-2-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
        {
          id: 'active',
          label: t('kpiActive'),
          value: String(activeCount),
          icon: 'graph-up-bold',
          accent: 'bg-success/15 text-success ring-success/25',
        },
        {
          id: 'expiring',
          label: t('kpiExpiring'),
          value: String(expiringSoon),
          tone: expiringSoon > 0 ? 'warning' : 'default',
          icon: 'danger-triangle-bold',
          accent:
            expiringSoon > 0
              ? 'bg-warning/15 text-warning ring-warning/25'
              : 'bg-info/15 text-info ring-info/25',
        },
      ]}
      searchPlaceholder={t('search')}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="buildings-2-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
      rows={organizations}
      rowKey={(r) => r.id}
      columns={[
        {
          id: 'name',
          header: t('orgs'),
          cell: (r) => (
            <button
              type="button"
              className="text-start"
              onClick={() => {
                setSelectedId(r.id);
                setThemePreset(r.themePreset);
              }}
            >
              <span className="block font-medium text-primary hover:underline">{r.name}</span>
              <span className="block text-xs text-muted-fg">{r.slug}</span>
            </button>
          ),
        },
        {
          id: 'plan',
          header: t('plan'),
          cell: (r) => r.subscription?.planName ?? '—',
        },
        {
          id: 'status',
          header: t('status'),
          cell: (r) =>
            r.subscription ? (
              <StatusBadge
                tone={statusTone(r.subscription.status)}
                icon={statusIcon(r.subscription.status)}
                label={tBilling(`statuses.${r.subscription.status}` as 'statuses.active')}
              />
            ) : (
              '—'
            ),
        },
        {
          id: 'expires',
          header: t('expires'),
          className: 'zarva-num',
          cell: (r) =>
            r.subscription?.currentPeriodEnd
              ? new Date(r.subscription.currentPeriodEnd).toLocaleDateString()
              : '—',
        },
        {
          id: 'theme',
          header: t('theme'),
          cell: (r) => t(`themes.${r.themePreset}` as 'themes.zarva-gold'),
        },
      ]}
      footer={
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-fg">
          <span>
            {tCommon('total')}: <span className="zarva-num text-foreground">{organizations.length}</span>
          </span>
        </div>
      }
      belowTable={
        selected ? (
          <div className="zarva-glass-card mt-4 grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t('assign')}</h3>
              <p className="text-sm text-secondary">{selected.name}</p>
              <Select value={planId} onValueChange={(v) => v && setPlanId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('plan')} />
                </SelectTrigger>
                <SelectContent>
                  {sellablePlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={interval === 'month' ? 'primary' : 'ghost'}
                  onClick={() => setInterval('month')}
                >
                  {tBilling('monthly')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={interval === 'year' ? 'primary' : 'ghost'}
                  onClick={() => setInterval('year')}
                >
                  {tBilling('yearly')}
                </Button>
              </div>
              <label className="flex flex-col gap-1 text-xs text-muted-fg">
                {interval === 'year' ? t('years') : t('months')}
                <input
                  type="number"
                  min={1}
                  max={36}
                  className="zarva-glass-input h-10 px-3 text-sm text-foreground"
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <Button type="button" disabled={pending} onClick={saveSubscription}>
                {pending ? tCommon('loading') : t('save')}
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t('theme')}</h3>
              <Select value={themePreset} onValueChange={(v) => v && setThemePreset(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_PRESETS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {t(`themes.${id}` as 'themes.zarva-gold')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" disabled={pending} onClick={saveTheme}>
                {pending ? tCommon('loading') : t('save')}
              </Button>
              <h3 className="pt-2 text-sm font-medium">{t('maxDevices')}</h3>
              <p className="text-xs text-muted-fg">{t('maxDevicesHint')}</p>
              <input
                type="number"
                min={0}
                className="zarva-glass-input h-10 px-3 text-sm text-foreground"
                value={maxDevices}
                placeholder={t('unlimited')}
                onChange={(e) => setMaxDevices(e.target.value)}
              />
              <Button type="button" disabled={pending} onClick={saveSecurityPolicy}>
                {pending ? tCommon('loading') : t('savePolicy')}
              </Button>
            </div>
            {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
            {message ? <p className="text-sm text-success md:col-span-2">{message}</p> : null}
          </div>
        ) : null
      }
    />
  );
}
