import { NESTED_ROUTE_MESSAGES, SIDEBAR_LINKS } from './nav-links';

/** Strip `/{locale}` from a Next pathname → app path like `/sales`. */
export function stripLocalePath(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/dashboard';
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || '/dashboard';
  }
  return pathname || '/dashboard';
}

/**
 * Resolve a display title for the current app path.
 * `tNav` = `useTranslations('nav')`, `tFull` = `useTranslations()`.
 */
export function resolveRouteTitle(
  appPath: string,
  tNav: (key: string) => string,
  tFull: (key: string) => string,
): string {
  const nested = [...NESTED_ROUTE_MESSAGES]
    .filter((r) => appPath === r.href || appPath.startsWith(`${r.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (nested) return tFull(nested.messageKey);

  const link = [...SIDEBAR_LINKS]
    .filter((r) => appPath === r.href || appPath.startsWith(`${r.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (link) return tNav(link.labelKey);

  return tNav('dashboard');
}
