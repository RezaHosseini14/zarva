import { NextResponse } from 'next/server';

import { fetchLiveMarketRates } from '@/features/dashboard/fetch-live-market-rates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(): Promise<NextResponse> {
  const payload = await fetchLiveMarketRates();
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
