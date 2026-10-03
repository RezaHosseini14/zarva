'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { IOrgProfile } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateOrganizationProfileAction } from '@/features/organization/organization-actions';

interface IProps {
  readonly profile: IOrgProfile;
  readonly isError?: boolean;
}

export function OrganizationProfileForm({ profile, isError }: IProps) {
  const t = useTranslations('modules.organization');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [name, setName] = useState(profile.name);
  const [taxId, setTaxId] = useState(profile.taxId);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState(isError);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(false);
    startTransition(async () => {
      const res = await updateOrganizationProfileAction({ name, taxId, phone, address });
      if (!res.ok) {
        setSaveError(true);
      }
    });
  }

  return (
    <form
      className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-secondary">{t('fields.name')}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} name="name" required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-secondary">{t('fields.taxId')}</span>
          <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} name="taxId" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-secondary">{t('fields.phone')}</span>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} name="phone" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="text-secondary">{tAuth('address')}</span>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} name="address" />
        </label>
      </div>
      {saveError ? (
        <p className="text-sm text-danger" role="alert">
          {tCommon('sectionErrorTitle')}
        </p>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
