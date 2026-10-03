'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { canAccessSubject } from '@zarva/shared';

import { cn } from '@/lib/utils';
import { ZarvaMark } from '@/components/brand/zarva-mark';
import { Icon } from '@/components/ui/icon';
import { useAppAbility, useAuth } from '@/features/auth/auth-provider';
import { SIDEBAR_GROUPS, SIDEBAR_LINKS } from './nav-links';
import { UserMenu } from './user-menu';

interface IAppSidebarProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function AppSidebar({ open, onClose }: IAppSidebarProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const ability = useAppAbility();
  const { user } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  const visible = SIDEBAR_LINKS.filter((link) => {
    if (link.roles && (!user || !link.roles.includes(user.roleName))) {
      return false;
    }
    return canAccessSubject(ability, link.subject);
  });

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
  }, [pathname, visible.length]);

  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-black/50 lg:hidden', open ? 'block' : 'hidden')}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'zarva-glass-sidebar relative z-50 flex w-[16.5rem] shrink-0 flex-col',
          /* mobile drawer — inset matches shell padding */
          'fixed inset-y-[var(--shell-inset)] start-[var(--shell-inset)]',
          /* desktop: normal flex sibling so top aligns with header (shell already pads) */
          'lg:static lg:inset-auto lg:h-full',
          /* transform only on mobile — any transform (even 0) kills backdrop-filter */
          'max-lg:transition-transform max-lg:duration-200',
          open
            ? 'max-lg:translate-x-0'
            : 'max-lg:-translate-x-[calc(100%+var(--shell-inset))] max-lg:rtl:translate-x-[calc(100%+var(--shell-inset))]',
        )}
      >
        <div className="relative border-b border-border/60 px-4 py-4">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-3 text-primary"
          >
            <span className="zarva-brand-mark !size-9" aria-hidden>
              <ZarvaMark />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-semibold tracking-wide">{tCommon('appName')}</span>
              <span className="mt-0.5 block text-[10px] font-normal uppercase tracking-wider text-muted-fg">
                {t('tagline')}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="absolute end-3 top-3 p-2 lg:hidden"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close-circle-bold" className="text-xl" />
          </button>
        </div>
        <nav ref={navRef} className="zarva-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
          {SIDEBAR_GROUPS.map((group) => {
            const items = visible.filter((l) => l.group === group.id);
            if (!items.length) return null;
            return (
              <div key={group.id}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
                  {t(group.labelKey)}
                </p>
                <div className="space-y-1">
                  {items.map((link) => {
                    const href = `/${locale}${link.href}`;
                    const isExact = pathname === href;
                    const isNested =
                      link.href !== '/dashboard' &&
                      pathname.startsWith(`${href}/`) &&
                      !SIDEBAR_LINKS.some(
                        (other) =>
                          other.href !== link.href &&
                          other.href.startsWith(`${link.href}/`) &&
                          (pathname === `/${locale}${other.href}` ||
                            pathname.startsWith(`/${locale}${other.href}/`)),
                      );
                    const isActive = isExact || isNested;
                    return (
                      <Link
                        key={link.href}
                        href={href}
                        onClick={onClose}
                        data-active={isActive ? 'true' : undefined}
                        className={cn(
                          'zarva-nav-item flex min-h-11 items-center gap-3 rounded-xl px-3 ps-3.5 text-base',
                          isActive ? 'text-primary' : 'text-secondary',
                        )}
                      >
                        <Icon
                          name={isActive ? link.iconActive : link.icon}
                          className="zarva-nav-item-icon shrink-0 text-lg text-primary"
                        />
                        {t(link.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-border/60 p-2">
          <UserMenu onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}

interface IMenuButtonProps {
  readonly onClick: () => void;
}

export function SidebarMenuButton({ onClick }: IMenuButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary lg:hidden"
      onClick={onClick}
      aria-label="Menu"
    >
      <Icon name="hamburger-menu-bold" className="text-xl" />
    </button>
  );
}
