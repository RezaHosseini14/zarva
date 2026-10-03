import { getApiBaseUrl } from '@/lib/auth/cookie-names';

export interface IPlanPrice {
  readonly id: string;
  readonly interval: string;
  readonly amountCents: number;
  readonly currency: string;
}

export interface IPlanRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly prices: ReadonlyArray<IPlanPrice>;
}

export async function getPublicPlans(): Promise<ReadonlyArray<IPlanRow>> {
  const res = await fetch(`${getApiBaseUrl()}/plans`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`plans ${res.status}`);
  }
  return (await res.json()) as ReadonlyArray<IPlanRow>;
}
