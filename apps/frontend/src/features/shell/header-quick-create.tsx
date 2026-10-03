'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { canAccessSubject, type AppSubjects } from '@zarva/shared';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppAbility, useAuth } from '@/features/auth/auth-provider';
import { HeaderActionTooltip } from './header-action-tooltip';

interface IQuickCreateItem {
  readonly href: string;
  readonly labelKey: 'newSale' | 'newPurchase' | 'customers';
  readonly icon: IconName;
  readonly subject: AppSubjects;
}

const ITEMS: ReadonlyArray<IQuickCreateItem> = [
  {
    href: '/sales/new',
    labelKey: 'newSale',
    icon: 'cart-large-2-bold',
    subject: 'Sale',
  },
  {
    href: '/purchases/new',
    labelKey: 'newPurchase',
    icon: 'box-bold',
    subject: 'Purchase',
  },
  {
    href: '/customers',
    labelKey: 'customers',
    icon: 'users-group-rounded-bold',
    subject: 'Customer',
  },
];

export function HeaderQuickCreate() {
  const t = useTranslations('shell.header');
  const locale = useLocale();
  const ability = useAppAbility();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const visible = ITEMS.filter((item) => canAccessSubject(ability, item.subject));
  if (visible.length === 0) return null;

  const contentDir = locale === 'en' ? 'ltr' : 'rtl';

  return (
    <HeaderActionTooltip label={t('quickCreateAria')} disabled={open}>
      <span className="inline-flex">
        <DropdownMenu dir="ltr" modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="zarva-header-action"
              aria-label={t('quickCreateAria')}
            >
              <Icon
                name={open ? 'add-circle-bold' : 'add-circle-linear'}
                className="zarva-header-action__icon text-[1.25rem]"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            className="min-w-56 p-0"
          >
            <div dir={contentDir} className="overflow-hidden rounded-[inherit]">
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">{t('quickCreateTitle')}</p>
              </div>
              <div className="flex flex-col gap-0.5 p-2">
                {visible.map((item) => (
                  <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
                    <Link
                      href={`/${locale}${item.href}`}
                      className="flex w-full items-center gap-2.5"
                    >
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                        <Icon name={item.icon} className="text-base" />
                      </span>
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </HeaderActionTooltip>
  );
}
