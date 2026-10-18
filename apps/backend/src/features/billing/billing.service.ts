import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  IPlanEntitlements,
  IBillingProvider,
  SubscriptionSource,
  SubscriptionStatus,
} from '@zarva/shared';
import Stripe from 'stripe';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { MockBillingProvider } from './mock-billing.provider';
import { StripeBillingProvider } from './stripe-billing.provider';

const BILLING_EXEMPT_MODULES = new Set(['billing', 'auth']);

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly provider: IBillingProvider;
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    mock: MockBillingProvider,
    stripeProvider: StripeBillingProvider,
  ) {
    this.provider =
      this.config.get('BILLING_PROVIDER') === 'stripe' ? stripeProvider : mock;
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  /** Effective checkout provider for UI labeling (mock vs live Stripe). */
  getCheckoutProviderLabel(): 'stripe' | 'mock' {
    const name = this.config.get<string>('BILLING_PROVIDER') ?? 'mock';
    const key = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
    if (name === 'stripe' && key.trim().length > 0) {
      return 'stripe';
    }
    return 'mock';
  }

  async listPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      include: { prices: true },
      orderBy: { code: 'asc' },
    });
  }

  async getSubscription(organizationId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: { include: { prices: true } } },
    });
    if (!sub) {
      throw new NotFoundException('No subscription');
    }
    return sub;
  }

  getEntitlements(planEntitlements: unknown): IPlanEntitlements {
    return planEntitlements as IPlanEntitlements;
  }

  async resolveEntitlements(organizationId: string): Promise<IPlanEntitlements> {
    const sub = await this.getSubscription(organizationId);
    const base = this.getEntitlements(sub.plan.entitlements);
    const override = await this.prisma.entitlementOverride.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    if (!override) {
      return base;
    }
    return { ...base, ...(override.entitlements as unknown as IPlanEntitlements) };
  }

  async assertModule(organizationId: string, moduleKey: string): Promise<void> {
    if (BILLING_EXEMPT_MODULES.has(moduleKey)) {
      return;
    }

    const sub = await this.getSubscription(organizationId);
    if (sub.status === 'canceled' || sub.status === 'expired') {
      throw new ForbiddenException('Subscription inactive');
    }
    if (sub.status === 'past_due') {
      const entitlements = await this.resolveEntitlements(organizationId);
      const graceMs = entitlements.graceDaysPastDue * 86_400_000;
      const end = sub.currentPeriodEnd?.getTime() ?? 0;
      if (Date.now() > end + graceMs) {
        throw new ForbiddenException('Subscription past due');
      }
    }
    const entitlements = await this.resolveEntitlements(organizationId);
    if (!entitlements.modules.includes(moduleKey) && !entitlements.modules.includes('*')) {
      throw new ForbiddenException(`Module not in plan: ${moduleKey}`);
    }
  }

  async createCheckout(user: IAuthUser, priceId: string, successUrl: string, cancelUrl: string) {
    const providerName = this.config.get<string>('BILLING_PROVIDER') ?? 'mock';
    if (process.env.NODE_ENV === 'production') {
      const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
      if (providerName !== 'stripe' || !stripeKey.trim()) {
        throw new BadRequestException(
          'Production billing requires BILLING_PROVIDER=stripe and STRIPE_SECRET_KEY',
        );
      }
    }

    const price = await this.prisma.planPrice.findFirst({
      where: { OR: [{ id: priceId }, { stripePriceId: priceId }] },
      include: { plan: true },
    });
    if (!price) {
      throw new BadRequestException('Unknown price');
    }

    let customer = await this.prisma.billingCustomer.findUnique({
      where: { organizationId: user.organizationId },
    });
    if (!customer) {
      const stripeCustomerId = await this.provider.createCustomer(
        user.organizationId,
        user.email,
        user.name,
      );
      customer = await this.prisma.billingCustomer.create({
        data: {
          organizationId: user.organizationId,
          stripeCustomerId,
        },
      });
    }

    const externalPriceId = price.stripePriceId ?? price.id;
    const session = await this.provider.createCheckoutSession({
      customerId: customer.stripeCustomerId,
      priceId: externalPriceId,
      successUrl,
      cancelUrl,
      organizationId: user.organizationId,
    });

    if (this.config.get('BILLING_PROVIDER') !== 'stripe') {
      const days = price.interval === 'year' ? 365 : 30;
      const now = new Date();
      await this.prisma.subscription.update({
        where: { organizationId: user.organizationId },
        data: {
          planId: price.planId,
          status: 'active',
          source: 'stripe',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + days * 86_400_000),
        },
      });
    }

    return session;
  }

  async createPortal(user: IAuthUser, returnUrl: string) {
    const customer = await this.prisma.billingCustomer.findUnique({
      where: { organizationId: user.organizationId },
    });
    if (!customer) {
      throw new BadRequestException('No billing customer');
    }
    return this.provider.createPortalSession(customer.stripeCustomerId, returnUrl);
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined): Promise<{ ok: true }> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret) {
      throw new BadRequestException('Stripe webhook not configured');
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      this.logger.warn(`Webhook signature failed: ${String(err)}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    return this.processStripeEvent(event);
  }

  /** Dev/mock path without signature verification. */
  async handleWebhook(provider: string, eventId: string, type: string, payload?: unknown): Promise<{ ok: true }> {
    const existing = await this.prisma.webhookEvent.findUnique({ where: { eventId } });
    if (existing) {
      return { ok: true };
    }
    await this.prisma.webhookEvent.create({
      data: { provider, eventId, type },
    });

    if (provider === 'stripe' && payload && typeof payload === 'object') {
      await this.applyStripeEventType(type, payload as Record<string, unknown>);
    }
    return { ok: true };
  }

  private async processStripeEvent(event: Stripe.Event): Promise<{ ok: true }> {
    const existing = await this.prisma.webhookEvent.findUnique({ where: { eventId: event.id } });
    if (existing) {
      return { ok: true };
    }
    await this.prisma.webhookEvent.create({
      data: { provider: 'stripe', eventId: event.id, type: event.type },
    });

    await this.applyStripeEventType(event.type, event.data.object as unknown as Record<string, unknown>);
    return { ok: true };
  }

  private async applyStripeEventType(type: string, object: Record<string, unknown>): Promise<void> {
    switch (type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionChanged(object, type === 'customer.subscription.deleted');
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await this.onInvoiceEvent(object, type === 'invoice.paid' ? 'paid' : 'open');
        break;
      default:
        break;
    }
  }

  private async onCheckoutCompleted(session: Record<string, unknown>): Promise<void> {
    const customerId = String(session.customer ?? '');
    const subscriptionId = session.subscription ? String(session.subscription) : null;
    const metadata = (session.metadata ?? {}) as Record<string, string>;
    let organizationId = metadata.organizationId;

    if (!organizationId && customerId) {
      const customer = await this.prisma.billingCustomer.findUnique({
        where: { stripeCustomerId: customerId },
      });
      organizationId = customer?.organizationId ?? '';
    }
    if (!organizationId) {
      this.logger.warn('checkout.session.completed without organization');
      return;
    }

    let planId: string | undefined;
    let periodEnd: Date | undefined;
    let periodStart: Date | undefined;

    if (subscriptionId && this.stripe) {
      const stripeSub = await this.stripe.subscriptions.retrieve(subscriptionId);
      periodEnd = new Date(stripeSub.current_period_end * 1000);
      periodStart = new Date(stripeSub.current_period_start * 1000);
      const priceId = stripeSub.items.data[0]?.price?.id;
      if (priceId) {
        const price = await this.prisma.planPrice.findFirst({
          where: { OR: [{ stripePriceId: priceId }, { id: priceId }] },
        });
        planId = price?.planId;
      }
      await this.syncSubscriptionFromStripe(organizationId, stripeSub, planId);
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        ...(planId ? { planId } : {}),
        status: 'active',
        source: 'stripe',
        stripeSubscriptionId: subscriptionId,
        currentPeriodStart: periodStart ?? new Date(),
        currentPeriodEnd: periodEnd,
      },
    });
  }

  private async onSubscriptionChanged(
    sub: Record<string, unknown>,
    deleted: boolean,
  ): Promise<void> {
    const stripeSubId = String(sub.id ?? '');
    const customerId = String(sub.customer ?? '');
    const customer = await this.prisma.billingCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!customer) {
      return;
    }

    if (deleted) {
      await this.prisma.subscription.update({
        where: { organizationId: customer.organizationId },
        data: {
          status: 'canceled',
          source: 'stripe',
          stripeSubscriptionId: stripeSubId,
          cancelAtPeriodEnd: true,
        },
      });
      return;
    }

    if (this.stripe) {
      const full = await this.stripe.subscriptions.retrieve(stripeSubId);
      const priceId = full.items.data[0]?.price?.id;
      let planId: string | undefined;
      if (priceId) {
        const price = await this.prisma.planPrice.findFirst({
          where: { OR: [{ stripePriceId: priceId }, { id: priceId }] },
        });
        planId = price?.planId;
      }
      await this.syncSubscriptionFromStripe(customer.organizationId, full, planId);
    }
  }

  private async syncSubscriptionFromStripe(
    organizationId: string,
    stripeSub: Stripe.Subscription,
    planId?: string,
  ): Promise<void> {
    const status = this.mapStripeStatus(stripeSub.status);
    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        ...(planId ? { planId } : {}),
        status,
        source: 'stripe' satisfies SubscriptionSource,
        stripeSubscriptionId: stripeSub.id,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'trialing':
        return 'trialing';
      case 'active':
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
      case 'unpaid':
        return 'canceled';
      case 'paused':
        return 'paused';
      default:
        return 'expired';
    }
  }

  private async onInvoiceEvent(invoice: Record<string, unknown>, status: string): Promise<void> {
    const customerId = String(invoice.customer ?? '');
    const customer = await this.prisma.billingCustomer.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (!customer) {
      return;
    }

    const stripeInvoiceId = invoice.id ? String(invoice.id) : null;
    const amountCents = Number(invoice.amount_paid ?? invoice.amount_due ?? 0);
    const currency = String(invoice.currency ?? 'usd');
    const hostedUrl = invoice.hosted_invoice_url ? String(invoice.hosted_invoice_url) : null;
    const pdfUrl = invoice.invoice_pdf ? String(invoice.invoice_pdf) : null;

    if (stripeInvoiceId) {
      await this.prisma.invoice.upsert({
        where: { stripeInvoiceId },
        create: {
          organizationId: customer.organizationId,
          stripeInvoiceId,
          amountCents,
          currency,
          status,
          hostedUrl,
          pdfUrl,
        },
        update: {
          amountCents,
          currency,
          status,
          hostedUrl,
          pdfUrl,
        },
      });
    }

    if (status === 'open') {
      await this.prisma.subscription.update({
        where: { organizationId: customer.organizationId },
        data: { status: 'past_due', source: 'stripe' },
      });
    }
  }

  async assignSubscription(
    organizationId: string,
    input: {
      planId: string;
      interval?: 'month' | 'year';
      status?: SubscriptionStatus;
      periodEnd?: Date;
      months?: number;
      years?: number;
    },
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: input.planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const now = new Date();
    let periodEnd = input.periodEnd;
    if (!periodEnd) {
      const days =
        input.years != null
          ? input.years * 365
          : input.months != null
            ? input.months * 30
            : input.interval === 'year'
              ? 365
              : 30;
      periodEnd = new Date(now.getTime() + days * 86_400_000);
    }

    return this.prisma.subscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        planId: input.planId,
        status: input.status ?? 'active',
        source: 'manual',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: input.planId,
        status: input.status ?? 'active',
        source: 'manual',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      include: { plan: { include: { prices: true } } },
    });
  }

  async setEntitlementOverride(
    organizationId: string,
    entitlements: IPlanEntitlements,
    reason?: string,
  ) {
    return this.prisma.entitlementOverride.create({
      data: {
        organizationId,
        entitlements: entitlements as object,
        reason: reason ?? null,
      },
    });
  }
}
