'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly title?: string;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

/** Minimal shell when a detail-route API load fails. */
export function DetailLoadError({ title, errorKind, chrome = 'full' }: IProps) {
  const t = useTranslations('common');
  const heading = title ?? t('pageErrorTitle');
  const body = (
    <>
      {chrome === 'body' ? null : <PageHeader title={heading} />}
      <SectionLoadError kind={errorKind} />
    </>
  );
  if (chrome === 'body') return body;
  return <AppShell title={heading}>{body}</AppShell>;
}
