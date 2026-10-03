'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/page/empty-state';
import { ZarvaAppCanvas } from '@/components/surfaces/zarva-app-canvas';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <ZarvaAppCanvas className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <EmptyState
          bordered
          icon="magnifer-bold"
          accent="bg-warning/15 text-warning ring-warning/25"
          title={t('notFoundTitle')}
          description={t('notFoundDescription')}
        />
        <div className="mt-2 flex justify-center pb-8">
          <Button asChild>
            <Link href={`/${locale}`}>{t('goHome')}</Link>
          </Button>
        </div>
      </div>
    </ZarvaAppCanvas>
  );
}
