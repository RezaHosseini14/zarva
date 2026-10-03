import { NextResponse } from 'next/server';

import { clearSessionCookies } from '@/lib/auth/session';

/** Clear auth cookies without calling Nest (works even if refresh already revoked). */
export async function POST(): Promise<NextResponse> {
  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
