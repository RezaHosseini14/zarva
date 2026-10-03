'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { ZarvaMark } from '@/components/brand/zarva-mark';
import { ZarvaAppCanvas } from '@/components/surfaces/zarva-app-canvas';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  return (
    <ZarvaAppCanvas className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="zarva-brand-mark" aria-hidden>
            <ZarvaMark />
          </span>
          <span className="font-semibold tracking-wide">{tCommon('appName')}</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="hidden min-h-11 items-center px-3 text-sm text-secondary hover:text-foreground sm:inline-flex"
          >
            {t('ctaPricing')}
          </Link>
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/login`}>{t('ctaLogin')}</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-16 pt-8 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {t('headline')}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
          {t('sub')}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild className="px-6">
            <Link href={`/${locale}/signup`}>{t('ctaTrial')}</Link>
          </Button>
          <Button variant="ghost" asChild className="px-6">
            <Link href={`/${locale}/login`}>{t('ctaLogin')}</Link>
          </Button>
        </div>
      </main>
    </ZarvaAppCanvas>
  );
}
