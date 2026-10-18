'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { ZarvaMark } from '@/components/brand/zarva-mark';
import { Icon } from '@/components/ui/icon';

import { SidebarNavCloseProvider } from './sidebar-nav-close-context';
import { UserMenu } from './user-menu';

interface IAppSidebarProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly navSlot: ReactNode;
}

export function AppSidebar({ open, onClose, navSlot }: IAppSidebarProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();

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
          'fixed inset-y-[var(--shell-inset)] start-[var(--shell-inset)]',
          'lg:static lg:inset-auto lg:h-full',
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
        <SidebarNavCloseProvider onClose={onClose}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{navSlot}</div>
        </SidebarNavCloseProvider>
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
