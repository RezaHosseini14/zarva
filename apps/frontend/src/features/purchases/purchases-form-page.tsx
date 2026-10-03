'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { SubNav } from '@/components/page/sub-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPurchaseAction } from '@/features/purchases/purchases-actions';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export function PurchasesFormPage({ chrome = 'full' }: IProps) {
  const t = useTranslations('modules.purchases');
  const tSettings = useTranslations('modules.settings');
  const tCommon = useTranslations('common');
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState(false);
  const isBody = chrome === 'body';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createPurchaseAction({
        supplierId: String(fd.get('supplierId') ?? ''),
        number: String(fd.get('number') ?? ''),
        displayDate: String(fd.get('displayDate') ?? ''),
        goldWeightGrams: Number(fd.get('goldWeightGrams') ?? 0),
        amountLabel: String(fd.get('amountLabel') ?? ''),
        purity: String(fd.get('purity') ?? '') || undefined,
        lineDescription: String(fd.get('lineDescription') ?? '') || undefined,
      });
      if (!res.ok) {
        setSaveError(true);
      }
    });
  }

  const body = (
    <>
      {isBody ? null : (
        <>
          <PageHeader title={t('newPurchase')} description={t('formDescription')} />
          <SubNav
            items={[
              { href: '/purchases', label: t('nav.list') },
              { href: '/purchases/new', label: t('nav.new') },
              { href: '/purchases/returns', label: t('nav.returns') },
            ]}
          />
        </>
      )}
      <form
        className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.supplier')}</span>
            <Input name="supplierId" placeholder={t('supplierPh')} required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.number')}</span>
            <Input name="number" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.date')}</span>
            <Input name="displayDate" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.weight')}</span>
            <Input name="goldWeightGrams" type="number" step="0.001" min="0.001" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.purity')}</span>
            <Input name="purity" placeholder="995" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('cols.amount')}</span>
            <Input name="amountLabel" required />
          </label>
          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="text-secondary">{tSettings('fields.note')}</span>
            <Input name="lineDescription" />
          </label>
        </div>
        {saveError ? (
          <p className="text-sm text-danger" role="alert">
            {tCommon('sectionErrorTitle')}
          </p>
        ) : null}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={pending}>
            {t('newPurchase')}
          </Button>
        </div>
      </form>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('newPurchase')}>{body}</AppShell>;
}
