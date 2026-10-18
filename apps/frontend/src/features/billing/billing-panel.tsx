'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { StatusBadge } from '@/components/page/status-badge';
import { Button } from '@/components/ui/button';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import {
  checkoutAction,
  portalAction,
} from '@/features/billing/billing-actions';
import type {
  BillingCheckoutProvider,
  IPlanPriceView,
  ISubscriptionView,
} from '@/features/billing/get-billing-subscription';

interface IProps {
  readonly subscription: ISubscriptionView | null;
  readonly plans: ReadonlyArray<{
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly prices: ReadonlyArray<IPlanPriceView>;
  }>;
  readonly checkoutProvider?: BillingCheckoutProvider;
  readonly chrome?: 'full' | 'body';
}

export function BillingPanel({
  subscription,
  plans,
  checkoutProvider = 'mock',
  chrome = 'full',
}: IProps) {
  const t = useTranslations('billing');
  const locale = useLocale();
  const isBody = chrome === 'body';
  const [pending, startTransition] = useTransition();

  function absoluteUrl(path: string): string {
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  }

  function handlePortal() {
    startTransition(async () => {
      const res = await portalAction({
        returnUrl: absoluteUrl(`/${locale}/settings/billing`),
      });
      if (res.ok) window.location.assign(res.url);
    });
  }

  function handleCheckout(priceId: string) {
    startTransition(async () => {
      const res = await checkoutAction({
        priceId,
        successUrl: absoluteUrl(`/${locale}/settings/billing?checkout=success`),
        cancelUrl: absoluteUrl(`/${locale}/settings/billing?checkout=cancel`),
      });
      if (res.ok) window.location.assign(res.url);
    });
  }

  const body = (
    <>
      {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
      {checkoutProvider === 'mock' ? (
        <div className="mb-3">
          <StatusBadge label={t('mockBadge')} tone="warning" icon="danger-triangle-bold" />
        </div>
      ) : null}
      <DashboardPanel
        title={subscription?.plan.name ?? t('emptyTitle')}
        icon="bill-list-bold"
        accent="bg-primary/15 text-primary ring-primary/25"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={pending} onClick={handlePortal}>
            {t('manage')}
          </Button>
        </div>
        <ul className="space-y-3 text-sm">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0"
            >
              <div>
                <span className="font-medium">{plan.name}</span>
                <span className="zarva-num ms-2 text-muted-fg">{plan.code}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.prices.map((price) => (
                  <Button
                    key={price.id}
                    type="button"
                    variant="primary"
                    disabled={pending}
                    onClick={() => handleCheckout(price.id)}
                  >
                    {t('upgrade')} · {price.interval}
                  </Button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </DashboardPanel>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('title')}>{body}</AppShell>;
}
