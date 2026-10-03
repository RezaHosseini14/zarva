import { NESTED_ROUTE_MESSAGES, SIDEBAR_LINKS } from './nav-links';

export interface IHeaderCrumb {
  readonly href: string;
  readonly label: string;
  readonly isCurrent: boolean;
}

interface IBuildHeaderCrumbsParams {
  readonly pathname: string;
  readonly locale: string;
  readonly pageTitle: string;
  readonly translateNav: (key: string) => string;
  readonly translateFull: (key: string) => string;
}

function stripLocale(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/dashboard';
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || '/dashboard';
  }
  return pathname || '/dashboard';
}

function prefixHrefs(path: string): string[] {
  const parts = path.split('/').filter(Boolean);
  const hrefs: string[] = [];
  let acc = '';
  for (const part of parts) {
    acc += `/${part}`;
    hrefs.push(acc);
  }
  return hrefs;
}

function resolveLabel(
  href: string,
  pageTitle: string,
  isLast: boolean,
  translateNav: (key: string) => string,
  translateFull: (key: string) => string,
): string | null {
  const nested = NESTED_ROUTE_MESSAGES.find((r) => r.href === href);
  if (nested) return translateFull(nested.messageKey);

  const link = SIDEBAR_LINKS.find((r) => r.href === href);
  if (link) return translateNav(link.labelKey);

  if (isLast) return pageTitle;
  return null;
}

/** Build atelier trail crumbs from the current locale-aware pathname. */
export function buildHeaderCrumbs({
  pathname,
  locale,
  pageTitle,
  translateNav,
  translateFull,
}: IBuildHeaderCrumbsParams): IHeaderCrumb[] {
  const path = stripLocale(pathname, locale);
  const hrefs = prefixHrefs(path === '/' ? '/dashboard' : path);
  const crumbs: IHeaderCrumb[] = [];

  for (let i = 0; i < hrefs.length; i += 1) {
    const href = hrefs[i]!;
    const isLast = i === hrefs.length - 1;
    const label = resolveLabel(href, pageTitle, isLast, translateNav, translateFull);
    if (!label) continue;
    crumbs.push({
      href: `/${locale}${href}`,
      label,
      isCurrent: isLast,
    });
  }

  if (crumbs.length === 0) {
    crumbs.push({
      href: `/${locale}/dashboard`,
      label: pageTitle,
      isCurrent: true,
    });
  }

  return crumbs;
}
