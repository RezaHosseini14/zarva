'use client';

import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/page/error-state';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import {
  sectionErrorDescriptionKey,
  sectionErrorTitleKey,
} from '@/lib/auth/section-load-error';

interface IProps {
  readonly kind?: SectionErrorKind;
  readonly compact?: boolean;
  readonly className?: string;
}

export function SectionLoadError({ kind = 'server', compact, className }: IProps) {
  const t = useTranslations('common');
  return (
    <ErrorState
      title={t(sectionErrorTitleKey(kind))}
      description={t(sectionErrorDescriptionKey(kind))}
      compact={compact}
      className={className}
    />
  );
}
