'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { logoutAction } from '@/features/auth/actions';
import { useAuth } from '@/features/auth/auth-provider';
import { useNavigateWithTransition } from '@/features/shell/navigation-progress';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

interface IUserMenuProps {
  readonly onNavigate?: () => void;
}

export function UserMenu({ onNavigate }: IUserMenuProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const navigate = useNavigateWithTransition();
  const { user, clearSession } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    void (async () => {
      await logoutAction();
      clearSession();
      onNavigate?.();
      await navigate(`/${locale}/login`);
      router.refresh();
    })();
  };

  const roleLabel = t.has(`roles.${user.roleName}`)
    ? t(`roles.${user.roleName}` as 'roles.SUPER_ADMIN')
    : user.roleName;
  const initials = initialsFromName(user.name);
  const contentDir = locale === 'en' ? 'ltr' : 'rtl';

  return (
    <DropdownMenu dir={contentDir} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-start outline-none"
        >
          <Avatar className="size-10 shrink-0 bg-primary/15 text-primary ring-1 ring-primary/25">
            <AvatarFallback className="bg-transparent text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 flex-col">
            <span className="block w-full truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="mt-0.5 block w-full truncate text-xs text-secondary">{roleLabel}</span>
          </span>
          <Icon name="alt-arrow-up-bold" className="shrink-0 text-base text-muted-fg" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        avoidCollisions={false}
        className="w-(--radix-dropdown-menu-trigger-width) min-w-0 p-0"
      >
        <div dir={contentDir} className="overflow-hidden rounded-[inherit]">
          <div className="relative border-b border-border/60 px-4 pb-4 pt-4">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_-10%,rgba(201,162,39,0.14),transparent_70%)]"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <Avatar className="size-12 shrink-0 bg-primary/20 text-primary ring-2 ring-primary/30">
                <AvatarFallback className="bg-transparent text-base font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {user.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-fg">{user.email}</p>
                <span className="mt-2 inline-flex max-w-full truncate rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 p-2">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                href={`/${locale}/account/devices`}
                onClick={onNavigate}
                className="flex w-full items-center gap-1.5"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-data-[highlighted]/dropdown-menu-item:bg-primary/20 group-data-[highlighted]/dropdown-menu-item:ring-primary/35">
                  <Icon name="shield-keyhole-bold" className="text-base" />
                </span>
                <span className="font-medium">{t('devicesMenu')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                href={`/${locale}/settings`}
                onClick={onNavigate}
                className="flex w-full items-center gap-1.5"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition-colors group-data-[highlighted]/dropdown-menu-item:bg-primary/20 group-data-[highlighted]/dropdown-menu-item:ring-primary/35">
                  <Icon name="settings-bold" className="text-base" />
                </span>
                <span className="font-medium">{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-1 my-1.5 bg-border/70" />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onSelect={handleLogout}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-danger/10 text-danger ring-1 ring-danger/20">
                <Icon name="logout-2-bold" className="text-base" />
              </span>
              <span className="font-medium">{t('logout')}</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
