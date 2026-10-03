'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { DashboardPanel } from '@/features/dashboard/dashboard-panel';
import type {
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
  readonly chrome?: 'full' | 'body';
}

export function BillingPanel({ subscription, plans, chrome = 'full' }: IProps) {
  const t = useTranslations('billing');
  const isBody = chrome === 'body';

  const body = (
    <>
      {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
      <DashboardPanel
        title={subscription?.plan.name ?? t('emptyTitle')}
        icon="bill-list-bold"
        accent="bg-primary/15 text-primary ring-primary/25"
      >
        <ul className="space-y-2 text-sm">
          {plans.map((plan) => (
            <li key={plan.id} className="flex justify-between gap-4">
              <span>{plan.name}</span>
              <span className="zarva-num text-muted-fg">{plan.code}</span>
            </li>
          ))}
        </ul>
      </DashboardPanel>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('title')}>{body}</AppShell>;
}
