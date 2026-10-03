import 'server-only';

import { cookies } from 'next/headers';

import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SEC,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SEC,
} from './cookie-names';

export { ACCESS_COOKIE, REFRESH_COOKIE } from './cookie-names';

function cookieSecure(): boolean {
  return process.env.COOKIE_SECURE === 'true';
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}

export async function setSessionCookies(
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE_SEC,
  });
  if (refreshToken) {
    jar.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE_SEC,
    });
  }
}

export async function clearSessionCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/** Parse Nest `refresh_token` from upstream Set-Cookie header(s). */
export function extractNestRefreshToken(headers: Headers): string | null {
  const list: string[] =
    typeof headers.getSetCookie === 'function' ? [...headers.getSetCookie()] : [];
  if (list.length === 0) {
    const single = headers.get('set-cookie');
    if (single) {
      list.push(single);
    }
  }
  for (const entry of list) {
    const match = /(?:^|,\s*)refresh_token=([^;]+)/i.exec(entry);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}
