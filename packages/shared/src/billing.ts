export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'paused';

export type SubscriptionSource = 'stripe' | 'manual';

export type PlanCode = 'trial' | 'starter' | 'professional' | 'enterprise';

export type SubscriptionAlertKind = 'expiry_7d';

export interface IPlanEntitlements {
  readonly maxUsers: number;
  readonly maxBranches: number;
  readonly maxStorageMb: number;
  readonly modules: ReadonlyArray<string>;
  readonly features: ReadonlyArray<string>;
  readonly trialDays: number;
  readonly graceDaysPastDue: number;
}

export interface IPlan {
  readonly id: string;
  readonly code: PlanCode;
  readonly name: string;
  readonly entitlements: IPlanEntitlements;
  readonly isActive: boolean;
}

export interface IPlanPrice {
  readonly id: string;
  readonly planId: string;
  readonly interval: 'month' | 'year';
  readonly amountCents: number;
  readonly currency: string;
  readonly stripePriceId: string | null;
}

export interface IPlanWithPrices extends IPlan {
  readonly prices: ReadonlyArray<IPlanPrice>;
}

export interface ISubscription {
  readonly id: string;
  readonly organizationId: string;
  readonly planId: string;
  readonly status: SubscriptionStatus;
  readonly source: SubscriptionSource;
  readonly currentPeriodStart: string | null;
  readonly currentPeriodEnd: string | null;
  readonly cancelAtPeriodEnd: boolean;
  readonly stripeSubscriptionId: string | null;
}

export interface ISubscriptionView extends ISubscription {
  readonly plan: IPlanWithPrices;
}

export interface ICheckoutSessionResult {
  readonly url: string;
  readonly sessionId: string;
}

export interface IBillingProvider {
  createCustomer(organizationId: string, email: string, name: string): Promise<string>;
  createCheckoutSession(input: {
    readonly customerId: string;
    readonly priceId: string;
    readonly successUrl: string;
    readonly cancelUrl: string;
    readonly trialDays?: number;
    readonly organizationId?: string;
  }): Promise<ICheckoutSessionResult>;
  createPortalSession(customerId: string, returnUrl: string): Promise<{ readonly url: string }>;
}

export interface IAssignSubscriptionRequest {
  readonly planId: string;
  readonly interval?: 'month' | 'year';
  readonly status?: SubscriptionStatus;
  readonly periodEnd?: string;
  readonly months?: number;
  readonly years?: number;
}

export interface IEntitlementOverrideRequest {
  readonly entitlements: IPlanEntitlements;
  readonly reason?: string;
}

export interface IPlatformOrganizationSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly themePreset: string;
  readonly createdAt: string;
  readonly subscription: {
    readonly status: SubscriptionStatus;
    readonly source: SubscriptionSource;
    readonly currentPeriodEnd: string | null;
    readonly planCode: string;
    readonly planName: string;
  } | null;
}

export interface IPlatformOrganizationDetail
  extends Omit<IPlatformOrganizationSummary, 'subscription'> {
  readonly themeTokens: unknown;
  readonly entitlements: IPlanEntitlements | null;
  readonly entitlementOverride: IPlanEntitlements | null;
  readonly subscription: ISubscriptionView | null;
}
