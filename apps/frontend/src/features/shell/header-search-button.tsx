'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/auth-provider';
import { HeaderActionTooltip } from './header-action-tooltip';

export function HeaderSearchButton() {
  const t = useTranslations('shell.header');
  const locale = useLocale();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <HeaderActionTooltip label={t('searchAria')}>
      <Link
        href={`/${locale}/search`}
        className="zarva-header-action"
        aria-label={t('searchAria')}
      >
        <Icon name="magnifer-linear" className="zarva-header-action__icon text-[1.25rem]" />
      </Link>
    </HeaderActionTooltip>
  );
}
