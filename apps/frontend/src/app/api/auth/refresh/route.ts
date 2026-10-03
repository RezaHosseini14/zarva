import { NextResponse } from 'next/server';

import { refreshSessionFromCookies } from '@/lib/auth/nest-auth';
import { clearSessionCookies } from '@/lib/auth/session';

export async function POST() {
  const refreshed = await refreshSessionFromCookies();
  if (!refreshed) {
    await clearSessionCookies();
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    user: refreshed.user,
    ok: true,
  });
}
