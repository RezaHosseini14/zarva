import { NextResponse } from 'next/server';

import { refreshSessionFromCookies } from '@/lib/auth/nest-auth';
import { clearSessionCookies, getAccessToken } from '@/lib/auth/session';

/**
 * Short-lived endpoint for Socket.IO handshake only.
 * Prefer BFF for HTTP; never persist this value in localStorage.
 */
export async function GET() {
  let accessToken = await getAccessToken();
  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    accessToken = refreshed?.accessToken ?? null;
  }
  if (!accessToken) {
    await clearSessionCookies();
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ accessToken });
}
