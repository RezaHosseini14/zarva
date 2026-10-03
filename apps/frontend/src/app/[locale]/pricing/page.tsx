import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ZarvaMark } from '@/components/brand/zarva-mark';
import { ZarvaAppCanvas } from '@/components/surfaces/zarva-app-canvas';
import { Button } from '@/components/ui/button';
import { PricingPlansSection } from '@/features/pricing/pricing-plans-section';

interface IPricingPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: IPricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pricing');
  const tCommon = await getTranslations('common');

  return (
    <ZarvaAppCanvas className="min-h-dvh px-4 py-10 sm:px-6 lg:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span className="zarva-brand-mark" aria-hidden>
            <ZarvaMark />
          </span>
          <span className="font-semibold tracking-wide">{tCommon('appName')}</span>
        </Link>
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/login`}>{t('cta')}</Link>
        </Button>
      </header>

      <div className="mx-auto mt-12 max-w-2xl text-start sm:text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-3 text-secondary">{t('subtitle')}</p>
      </div>

        <PricingPlansSection />
    </ZarvaAppCanvas>
  );
}
