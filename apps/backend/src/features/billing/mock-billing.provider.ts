import { Injectable } from '@nestjs/common';
import type { ICheckoutSessionResult, IBillingProvider } from '@zarva/shared';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MockBillingProvider implements IBillingProvider {
  async createCustomer(_organizationId: string, _email: string, _name: string): Promise<string> {
    return `cus_mock_${randomUUID()}`;
  }

  async createCheckoutSession(input: {
    readonly customerId: string;
    readonly priceId: string;
    readonly successUrl: string;
    readonly cancelUrl: string;
    readonly trialDays?: number;
    readonly organizationId?: string;
  }): Promise<ICheckoutSessionResult> {
    const sessionId = `cs_mock_${randomUUID()}`;
    const url = `${input.successUrl}${input.successUrl.includes('?') ? '&' : '?'}session_id=${sessionId}&mock=1&price=${input.priceId}`;
    return { url, sessionId };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<{ readonly url: string }> {
    return { url: `${returnUrl}?portal=1&customer=${customerId}` };
  }
}
