import { serverApiFetch } from '@/lib/auth/server-api';

export interface IPlanPriceView {
  readonly id: string;
  readonly interval: 'month' | 'year' | string;
  readonly amountCents: number;
  readonly currency: string;
}

export interface ISubscriptionView {
  readonly status: string;
  readonly source?: string;
  readonly currentPeriodEnd?: string | null;
  readonly cancelAtPeriodEnd?: boolean;
  readonly plan: {
    readonly name: string;
    readonly code: string;
    readonly prices?: ReadonlyArray<IPlanPriceView>;
  };
}

export async function getBillingSubscription(): Promise<ISubscriptionView | null> {
  try {
    return await serverApiFetch<ISubscriptionView>('/billing/subscription');
  } catch {
    return null;
  }
}

export type BillingCheckoutProvider = 'stripe' | 'mock';

export async function getBillingCheckoutProvider(): Promise<BillingCheckoutProvider> {
  try {
    const res = await serverApiFetch<{ provider: BillingCheckoutProvider }>(
      '/billing/checkout-provider',
    );
    return res.provider === 'stripe' ? 'stripe' : 'mock';
  } catch {
    return 'mock';
  }
}

export async function getBillingPlans(): Promise<
  ReadonlyArray<{
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly prices: ReadonlyArray<IPlanPriceView>;
  }>
> {
  try {
    return await serverApiFetch('/plans');
  } catch {
    return [];
  }
}
