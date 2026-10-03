'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateSettingsSectionAction } from '@/features/settings/settings-actions';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly section: string;
  readonly values: Readonly<Record<string, string>>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SettingsSectionPage({
  section,
  values,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.settings');
  const tCommon = useTranslations('common');
  const fieldKeys = useMemo(() => Object.keys(values), [values]);
  const [draft, setDraft] = useState<Record<string, string>>({ ...values });
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState(isError);
  const isBody = chrome === 'body';

  const displayFields = fieldKeys.length > 0 ? fieldKeys : (['f1', 'f2'] as const);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(false);
    startTransition(async () => {
      const res = await updateSettingsSectionAction({ section, values: draft });
      if (!res.ok) {
        setSaveError(true);
      }
    });
  }

  const body = (
    <>
      {isBody ? null : (
        <PageHeader
          title={t(`sections.${section}.title`)}
          description={t(`sections.${section}.description`)}
        />
      )}
      {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
      <form
        className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayFields.map((key) => (
            <label key={key} className="flex flex-col gap-1.5 text-sm">
              <span className="text-secondary">
                {fieldKeys.length > 0 ? key : t('fields.value')}
              </span>
              <Input
                name={key}
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={t('fields.placeholder')}
              />
            </label>
          ))}
        </div>
        {saveError ? (
          <p className="text-sm text-danger" role="alert">
            {tCommon('sectionErrorTitle')}
          </p>
        ) : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost">
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={pending}>
            {tCommon('save')}
          </Button>
        </div>
      </form>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t(`sections.${section}.title`)}>{body}</AppShell>;
}
