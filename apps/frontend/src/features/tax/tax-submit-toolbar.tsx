'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

interface IProps {
  readonly submitConfigured: boolean;
}

export function TaxSubmitToolbar({ submitConfigured }: IProps) {
  const t = useTranslations('modules.tax');

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" disabled={!submitConfigured}>
        {t('submitToAuthority')}
      </Button>
      {submitConfigured ? null : (
        <p className="text-xs text-muted-fg">{t('submitUnavailable')}</p>
      )}
    </div>
  );
}
