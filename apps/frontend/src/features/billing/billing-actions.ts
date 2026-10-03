'use server';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type CheckoutActionResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string };

export async function checkoutAction(input: {
  readonly priceId: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
}): Promise<CheckoutActionResult> {
  try {
    const res = await serverApiFetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: {
        priceId: input.priceId,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      },
    });
    if (!res?.url) {
      return { ok: false, error: 'Missing checkout URL' };
    }
    return { ok: true, url: res.url };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Checkout failed' };
  }
}

export async function portalAction(input: {
  readonly returnUrl: string;
}): Promise<CheckoutActionResult> {
  try {
    const res = await serverApiFetch<{ url: string }>('/billing/portal', {
      method: 'POST',
      body: { returnUrl: input.returnUrl },
    });
    if (!res?.url) {
      return { ok: false, error: 'Missing portal URL' };
    }
    return { ok: true, url: res.url };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Portal failed' };
  }
}
