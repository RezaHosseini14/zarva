import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_COOKIE, REFRESH_COOKIE } from './src/lib/auth/cookie-names';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Locale-relative segments that do not require a session. */
const PUBLIC_SEGMENTS = new Set([
  '',
  'pricing',
  'login',
  'signup',
  'forgot',
  'reset',
  'twofa',
  'invite',
]);

/** Auth pages: redirect to dashboard when a session cookie exists. */
const GUEST_ONLY_SEGMENTS = new Set([
  'login',
  'signup',
  'forgot',
  'reset',
  'twofa',
  'invite',
]);

function parseLocalePath(pathname: string): {
  readonly locale: string | null;
  readonly segment: string;
} {
  const parts = pathname.split('/').filter(Boolean);
  const maybeLocale = parts[0] ?? null;
  if (!maybeLocale || !routing.locales.includes(maybeLocale as 'fa' | 'en' | 'ar')) {
    return { locale: null, segment: '' };
  }
  const segment = parts.slice(1).join('/');
  return { locale: maybeLocale, segment };
}

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value ||
      request.cookies.get(REFRESH_COOKIE)?.value,
  );
}

export default function middleware(request: NextRequest) {
  const { locale, segment } = parseLocalePath(request.nextUrl.pathname);
  const rootSegment = segment.split('/')[0] ?? '';
  const isPublic =
    PUBLIC_SEGMENTS.has(segment) || PUBLIC_SEGMENTS.has(rootSegment);

  if (locale) {
    const authed = hasSessionCookie(request);

    if (!isPublic && !authed) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    if (authed && GUEST_ONLY_SEGMENTS.has(rootSegment)) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = `/${locale}/dashboard`;
      dashUrl.search = '';
      return NextResponse.redirect(dashUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fa|en|ar)/:path*'],
};
