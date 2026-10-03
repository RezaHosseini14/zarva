'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IStubFormProps {
  readonly fields: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly placeholder?: string;
  }>;
  readonly children?: ReactNode;
  readonly onSubmitLabel?: string;
}

/** Presentation-only form shell — wires to APIs later. */
export function StubForm({ fields, children, onSubmitLabel }: IStubFormProps) {
  const t = useTranslations('common');

  return (
    <form className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.id} className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{field.label}</span>
            <Input name={field.id} placeholder={field.placeholder} />
          </label>
        ))}
      </div>
      {children}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost">
          {t('cancel')}
        </Button>
        <Button type="submit">{onSubmitLabel ?? t('save')}</Button>
      </div>
    </form>
  );
}
