'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/page/error-state';
import { ZarvaAppCanvas } from '@/components/surfaces/zarva-app-canvas';

interface IErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function LocaleError({ error, reset }: IErrorPageProps) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('[route-error]', error);
  }, [error]);

  return (
    <ZarvaAppCanvas className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <ErrorState
          title={t('pageErrorTitle')}
          description={t('pageErrorDescription')}
          retryLabel={t('retry')}
          onRetry={reset}
        />
      </div>
    </ZarvaAppCanvas>
  );
}
