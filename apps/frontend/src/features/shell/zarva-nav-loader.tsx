'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

import { ZarvaMark } from '@/components/brand/zarva-mark';
import { cn } from '@/lib/utils';

import { useNavigationProgress } from './navigation-progress';

function subscribeNavLoaderPreview(): () => void {
  return () => undefined;
}

function getNavLoaderPreviewSnapshot(): boolean {
  return new URLSearchParams(window.location.search).get('navLoader') === '1';
}

function getNavLoaderPreviewServerSnapshot(): boolean {
  return false;
}

/** Non-blocking center brand mark while dashboard client navigations settle. */
export function ZarvaNavLoader() {
  const t = useTranslations('common');
  const { phase, start } = useNavigationProgress();
  const isPreview = useSyncExternalStore(
    subscribeNavLoaderPreview,
    getNavLoaderPreviewSnapshot,
    getNavLoaderPreviewServerSnapshot,
  );

  useEffect(() => {
    if (isPreview) start(true);
  }, [isPreview, start]);

  if (phase === 'idle' && !isPreview) return null;

  return (
    <div
      className={cn(
        'zarva-nav-loader',
        phase === 'exiting' && !isPreview && 'zarva-nav-loader--exit',
      )}
      role="status"
      aria-live="polite"
      aria-busy={phase === 'shown' || isPreview}
      aria-label={t('navLoading')}
    >
      <div className="zarva-nav-loader__vignette" aria-hidden />
      <span className="zarva-brand-mark zarva-nav-loader__brand" aria-hidden>
        <ZarvaMark />
      </span>
    </div>
  );
}
