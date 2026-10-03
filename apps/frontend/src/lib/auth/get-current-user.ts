import { redirect } from 'next/navigation';
import type { IUser } from '@zarva/shared';

import { nestAuthGetMe, NestAuthError, refreshSessionFromCookies } from './nest-auth';
import { clearSessionCookies, getAccessToken } from './session';

/**
 * Resolve the signed-in user on the server from httpOnly session cookies.
 * Attempts silent refresh when access is missing/expired.
 */
export async function getCurrentUser(): Promise<IUser | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    if (!refreshed) {
      return null;
    }
    return refreshed.user;
  }

  try {
    return await nestAuthGetMe(accessToken);
  } catch (error) {
    if (!(error instanceof NestAuthError) || error.status !== 401) {
      try {
        await clearSessionCookies();
      } catch {
        // ignore
      }
      return null;
    }
    const refreshed = await refreshSessionFromCookies();
    if (!refreshed) {
      try {
        await clearSessionCookies();
      } catch {
        // ignore
      }
      return null;
    }
    try {
      return await nestAuthGetMe(refreshed.accessToken);
    } catch {
      try {
        await clearSessionCookies();
      } catch {
        // ignore
      }
      return null;
    }
  }
}

export async function requireUser(locale: string): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  return user;
}
