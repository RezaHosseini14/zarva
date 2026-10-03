'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Icon } from '@/components/ui/icon';

import { buildHeaderCrumbs } from './build-header-crumbs';

interface IHeaderBreadcrumbProps {
  readonly title: string;
}

export function HeaderBreadcrumb({ title }: IHeaderBreadcrumbProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const t = useTranslations();
  const tHeader = useTranslations('shell.header');

  const crumbs = buildHeaderCrumbs({
    pathname,
    locale,
    pageTitle: title,
    translateNav: (key) => tNav(key),
    translateFull: (key) => t(key),
  });

  const homeHref = `/${locale}/dashboard`;
  const isHome = crumbs.length === 1 && crumbs[0]?.href === homeHref;

  return (
    <Breadcrumb aria-label={tHeader('breadcrumbAria')} className="zarva-breadcrumb">
      <BreadcrumbList className="zarva-breadcrumb__list">
        <BreadcrumbItem>
          {isHome ? (
            <span className="zarva-breadcrumb__home" aria-current="page">
              <Icon name="widget-2-bold" className="zarva-breadcrumb__home-icon text-[1.05rem]" />
            </span>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={homeHref} className="zarva-breadcrumb__home" aria-label={tNav('dashboard')}>
                <Icon name="widget-2-bold" className="zarva-breadcrumb__home-icon text-[1.05rem]" />
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator className="zarva-breadcrumb__sep" />
            <BreadcrumbItem className="min-w-0">
              {crumb.isCurrent ? (
                <BreadcrumbPage className="zarva-breadcrumb__page">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href} className="zarva-breadcrumb__link">
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
