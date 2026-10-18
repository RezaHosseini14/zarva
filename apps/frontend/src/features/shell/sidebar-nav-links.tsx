'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import type { ISidebarNavNode, SidebarNavGroupId } from '@zarva/shared';
import { SIDEBAR_NAV_GROUPS } from '@zarva/shared';

import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

import { useSidebarNavClose } from './sidebar-nav-close-context';
import { toSidebarIconName } from './sidebar-nav-icon';

interface ISidebarNavLinksProps {
  readonly items: ReadonlyArray<ISidebarNavNode>;
}

function collectHrefs(nodes: ReadonlyArray<ISidebarNavNode>): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    out.push(node.href);
    out.push(...collectHrefs(node.children));
  }
  return out;
}

function NavItemRow({
  link,
  locale,
  pathname,
  allHrefs,
  onNavigate,
  depth,
}: {
  readonly link: ISidebarNavNode;
  readonly locale: string;
  readonly pathname: string;
  readonly allHrefs: ReadonlyArray<string>;
  readonly onNavigate?: () => void;
  readonly depth: number;
}) {
  const t = useTranslations('nav');
  const href = `/${locale}${link.href}`;
  const isExact = pathname === href;
  const isNested =
    link.href !== '/dashboard' &&
    pathname.startsWith(`${href}/`) &&
    !allHrefs.some(
      (other) =>
        other !== link.href &&
        other.startsWith(`${link.href}/`) &&
        (pathname === `/${locale}${other}` ||
          pathname.startsWith(`/${locale}${other}/`)),
    );
  const isActive = isExact || isNested;

  return (
    <div className="space-y-1">
      <Link
        href={href}
        onClick={onNavigate}
        data-active={isActive ? 'true' : undefined}
        className={cn(
          'zarva-nav-item flex min-h-11 items-center gap-3 rounded-xl px-3 text-base',
          depth > 0 ? 'ps-6' : 'ps-3.5',
          isActive ? 'text-primary' : 'text-secondary',
        )}
      >
        <Icon
          name={toSidebarIconName(isActive ? link.iconActive : link.icon)}
          className="zarva-nav-item-icon shrink-0 text-lg text-primary"
        />
        {t(link.labelKey)}
      </Link>
      {link.children.length > 0 ? (
        <div className="space-y-1">
          {link.children.map((child) => (
            <NavItemRow
              key={child.id}
              link={child}
              locale={locale}
              pathname={pathname}
              allHrefs={allHrefs}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SidebarNavLinks({ items }: ISidebarNavLinksProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const onNavigate = useSidebarNavClose();
  const navRef = useRef<HTMLElement>(null);
  const allHrefs = collectHrefs(items);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[data-active="true"]');
    if (!nav || !active) return;

    const navRect = nav.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const above = activeRect.top - navRect.top;
    const below = activeRect.bottom - navRect.bottom;

    if (above < 0) {
      nav.scrollTop += above;
    } else if (below > 0) {
      nav.scrollTop += below;
    }
  }, [pathname, items.length]);

  const byGroup = (groupId: SidebarNavGroupId) =>
    items.filter((l) => l.group === groupId);

  return (
    <nav ref={navRef} className="zarva-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
      {SIDEBAR_NAV_GROUPS.map((group) => {
        const groupItems = byGroup(group.id);
        if (!groupItems.length) return null;
        return (
          <div key={group.id}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
              {t(group.labelKey)}
            </p>
            <div className="space-y-1">
              {groupItems.map((link) => (
                <NavItemRow
                  key={link.id}
                  link={link}
                  locale={locale}
                  pathname={pathname}
                  allHrefs={allHrefs}
                  onNavigate={onNavigate}
                  depth={0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
