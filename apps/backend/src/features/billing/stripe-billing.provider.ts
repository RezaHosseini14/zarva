import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { IBillingProvider, ICheckoutSessionResult } from '@zarva/shared';

@Injectable()
export class StripeBillingProvider implements IBillingProvider {
  private readonly stripe: Stripe | null;

  constructor(config: ConfigService) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  private client(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    return this.stripe;
  }

  async createCustomer(organizationId: string, email: string, name: string): Promise<string> {
    const customer = await this.client().customers.create({
      email,
      name,
      metadata: { organizationId },
    });
    return customer.id;
  }

  async createCheckoutSession(input: {
    readonly customerId: string;
    readonly priceId: string;
    readonly successUrl: string;
    readonly cancelUrl: string;
    readonly trialDays?: number;
    readonly organizationId?: string;
  }): Promise<ICheckoutSessionResult> {
    const session = await this.client().checkout.sessions.create({
      mode: 'subscription',
      customer: input.customerId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.organizationId ? { organizationId: input.organizationId } : undefined,
      subscription_data: {
        ...(input.trialDays ? { trial_period_days: input.trialDays } : {}),
        ...(input.organizationId ? { metadata: { organizationId: input.organizationId } } : {}),
      },
    });
    return { url: session.url ?? input.successUrl, sessionId: session.id };
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ readonly url: string }> {
    const session = await this.client().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }
}
