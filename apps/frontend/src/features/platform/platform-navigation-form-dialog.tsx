'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { SIDEBAR_NAV_GROUPS, SIDEBAR_NAV_ICONS } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const NAV_PARENT_NONE = '__none__';

export interface INavFormState {
  readonly key: string;
  readonly href: string;
  readonly labelKey: string;
  readonly icon: string;
  readonly iconActive: string;
  readonly group: string;
  readonly subject: string;
  readonly roles: string;
  readonly moduleKey: string;
  readonly parentId: string;
  readonly sortOrder: string;
  readonly isActive: boolean;
}

export const EMPTY_NAV_FORM: INavFormState = {
  key: '',
  href: '',
  labelKey: '',
  icon: 'settings-linear',
  iconActive: 'settings-bold',
  group: 'system',
  subject: 'Dashboard',
  roles: '',
  moduleKey: '',
  parentId: NAV_PARENT_NONE,
  sortOrder: '0',
  isActive: true,
};

interface IParentOption {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

interface IPlatformNavigationFormDialogProps {
  readonly open: boolean;
  readonly editing: boolean;
  readonly pending: boolean;
  readonly error: string | null;
  readonly form: INavFormState;
  readonly parentOptions: ReadonlyArray<IParentOption>;
  readonly groupLabel: (groupId: string) => string;
  readonly onFormChange: (next: INavFormState) => void;
  readonly onSubmit: () => void;
  readonly onClose: () => void;
}

export function PlatformNavigationFormDialog({
  open,
  editing,
  pending,
  error,
  form,
  parentOptions,
  groupLabel,
  onFormChange,
  onSubmit,
  onClose,
}: IPlatformNavigationFormDialogProps) {
  const t = useTranslations('platformNavigation');
  const tCommon = useTranslations('common');

  if (!open) return null;

  const set = <K extends keyof INavFormState>(key: K, value: INavFormState[K]) => {
    onFormChange({ ...form, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={tCommon('close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-form-title"
        className="zarva-glass-card relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col sm:mx-4"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2 id="nav-form-title" className="text-base font-semibold text-foreground">
            {editing ? t('editTitle') : t('createTitle')}
          </h2>
          <button
            type="button"
            className="text-secondary hover:text-foreground"
            aria-label={tCommon('close')}
            onClick={onClose}
          >
            <Icon name="close-circle-bold" className="text-xl" />
          </button>
        </header>

        <div className="zarva-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {!editing ? (
              <LabeledField label={t('fieldKey')}>
                <Input value={form.key} onChange={(e) => set('key', e.target.value)} />
              </LabeledField>
            ) : null}
            <LabeledField label={t('fieldHref')}>
              <Input value={form.href} onChange={(e) => set('href', e.target.value)} />
            </LabeledField>
            <LabeledField label={t('fieldLabelKey')}>
              <Input
                value={form.labelKey}
                onChange={(e) => set('labelKey', e.target.value)}
              />
            </LabeledField>
            <LabeledField label={t('fieldIcon')}>
              <Select value={form.icon} onValueChange={(v) => v && set('icon', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_NAV_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label={t('fieldIconActive')}>
              <Select
                value={form.iconActive}
                onValueChange={(v) => v && set('iconActive', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_NAV_ICONS.map((icon) => (
                    <SelectItem key={`a-${icon}`} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label={t('fieldGroup')}>
              <Select value={form.group} onValueChange={(v) => v && set('group', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_NAV_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {groupLabel(g.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label={t('fieldSubject')}>
              <Input
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
              />
            </LabeledField>
            <LabeledField label={t('fieldRoles')}>
              <Input value={form.roles} onChange={(e) => set('roles', e.target.value)} />
            </LabeledField>
            <LabeledField label={t('fieldModuleKey')}>
              <Input
                value={form.moduleKey}
                onChange={(e) => set('moduleKey', e.target.value)}
              />
            </LabeledField>
            <LabeledField label={t('fieldParentId')}>
              <Select
                value={form.parentId}
                onValueChange={(v) => v && set('parentId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('parentNone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NAV_PARENT_NONE}>{t('parentNone')}</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} ({p.href})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label={t('fieldSortOrder')}>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
            </LabeledField>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-fg">{t('fieldActive')}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={form.isActive ? 'primary' : 'ghost'}
                  onClick={() => set('isActive', true)}
                >
                  {t('statusActive')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!form.isActive ? 'primary' : 'ghost'}
                  onClick={() => set('isActive', false)}
                >
                  {t('statusInactive')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border/60 px-4 py-3">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="button" disabled={pending} onClick={onSubmit}>
            {editing ? t('save') : t('create')}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function LabeledField({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-muted-fg">
      {label}
      {children}
    </label>
  );
}
