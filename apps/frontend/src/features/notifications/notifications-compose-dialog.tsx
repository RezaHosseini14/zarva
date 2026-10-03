'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { NotificationAudience, NotificationPriority } from '@zarva/shared';
import { NOTIFICATION_PRIORITIES } from '@zarva/shared';

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
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/features/auth/auth-provider';
import { cn } from '@/lib/utils';
import { PRIORITY_ICON } from './notification-priority-badge';
import {
  useNotificationMutations,
  useRecipientOrgs,
  useRecipientUsers,
} from './use-notifications';

interface IProps {
  readonly open: boolean;
  readonly canPlatform: boolean;
  readonly onClose: () => void;
}

function allowedPriorities(
  roleName: string,
  permissions: ReadonlyArray<string>,
): NotificationPriority[] {
  if (roleName === 'SUPER_ADMIN' || roleName === 'PLATFORM_ADMIN') {
    return [...NOTIFICATION_PRIORITIES];
  }
  return NOTIFICATION_PRIORITIES.filter((p) =>
    permissions.includes(`notifications.send.${p.toLowerCase()}`),
  );
}

export function NotificationsComposeDialog({ open, canPlatform, onClose }: IProps) {
  const t = useTranslations('modules.notifications');
  const { user } = useAuth();
  const { create } = useNotificationMutations();
  const levels = useMemo(
    () => allowedPriorities(user?.roleName ?? 'VIEWER', user?.permissions ?? []),
    [user],
  );
  const defaultPriority: NotificationPriority = levels.includes('NORMAL')
    ? 'NORMAL'
    : (levels[0] ?? 'NORMAL');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<NotificationAudience>(
    canPlatform ? 'PLATFORM_ALL' : 'ORG_ALL',
  );
  const [priority, setPriority] = useState<NotificationPriority>(defaultPriority);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [organizationIds, setOrganizationIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const usersQ = useRecipientUsers(open && audience === 'USERS');
  const orgsQ = useRecipientOrgs(open && canPlatform && audience === 'ORGS');

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setBody('');
    setUserIds([]);
    setOrganizationIds([]);
    setFormError(null);
    setAudience(canPlatform ? 'PLATFORM_ALL' : 'ORG_ALL');
    setPriority(defaultPriority);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) {
      setFormError(t('compose.validation.required'));
      return;
    }
    if (!levels.includes(priority)) {
      setFormError(t('compose.validation.priority'));
      return;
    }
    if (audience === 'USERS' && userIds.length === 0) {
      setFormError(t('compose.validation.users'));
      return;
    }
    if (audience === 'ORGS' && organizationIds.length === 0) {
      setFormError(t('compose.validation.orgs'));
      return;
    }

    try {
      await create.mutateAsync({
        title: trimmedTitle,
        body: trimmedBody,
        audience,
        priority,
        ...(audience === 'USERS' ? { userIds } : {}),
        ...(audience === 'ORGS' ? { organizationIds } : {}),
      });
      reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 0) setFormError(t('compose.validation.network'));
        else if (err.status === 403) setFormError(t('compose.validation.forbidden'));
        else if (err.status === 400) setFormError(err.messages.join(' · ') || t('compose.error'));
        else setFormError(t('compose.error'));
        return;
      }
      setFormError(t('compose.error'));
    }
  };

  const toggleId = (list: string[], id: string, set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('compose.close')}
        onClick={close}
      />
      <form
        onSubmit={onSubmit}
        className="zarva-glass-card relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col sm:mx-4"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">{t('compose.title')}</h2>
          <button type="button" className="text-secondary hover:text-foreground" onClick={close}>
            <Icon name="close-circle-bold" className="text-xl" />
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 zarva-scrollbar">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('compose.fields.title')}</span>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('compose.fields.body')}</span>
            <Textarea required rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm text-secondary">{t('compose.fields.priority')}</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {levels.map((level) => {
                const selected = priority === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={cn(
                      'flex items-start gap-2 rounded-(--radius-control) border border-border/60 p-3 text-start transition',
                      selected && `notify-priority-card-selected-${level.toLowerCase()}`,
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
                        level === 'CRITICAL' && 'bg-danger/15 text-danger ring-danger/30',
                        level === 'HIGH' && 'bg-warning/15 text-warning ring-warning/30',
                        level === 'NORMAL' && 'bg-primary/15 text-primary ring-primary/25',
                        level === 'LOW' && 'bg-muted text-muted-fg ring-border',
                      )}
                    >
                      <Icon name={PRIORITY_ICON[level]} className="text-lg" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {t(`priority.${level.toLowerCase()}.label`)}
                      </span>
                      <span className="mt-0.5 block text-xs text-secondary">
                        {t(`priority.${level.toLowerCase()}.hint`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {levels.length === 0 ? (
              <p className="text-sm text-danger">{t('compose.validation.noPriority')}</p>
            ) : null}
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-secondary">{t('compose.fields.audience')}</span>
            <Select
              value={audience}
              onValueChange={(v) => {
                setAudience(v as NotificationAudience);
                setUserIds([]);
                setOrganizationIds([]);
                setFormError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORG_ALL">{t('compose.audience.orgAll')}</SelectItem>
                <SelectItem value="USERS">{t('compose.audience.users')}</SelectItem>
                {canPlatform ? (
                  <>
                    <SelectItem value="PLATFORM_ALL">{t('compose.audience.platformAll')}</SelectItem>
                    <SelectItem value="ORGS">{t('compose.audience.orgs')}</SelectItem>
                  </>
                ) : null}
              </SelectContent>
            </Select>
          </label>
          {audience === 'USERS' ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm text-secondary">{t('compose.fields.users')}</legend>
              <div className="max-h-40 flex flex-col gap-1 overflow-y-auto zarva-scrollbar">
                {usersQ.isLoading ? (
                  <p className="text-xs text-muted-fg">{t('compose.loading')}</p>
                ) : null}
                {usersQ.isError ? (
                  <p className="text-sm text-danger">{t('compose.validation.loadUsers')}</p>
                ) : null}
                {(usersQ.data ?? []).map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={userIds.includes(u.id)}
                      onChange={() => toggleId(userIds, u.id, setUserIds)}
                    />
                    <span className="truncate">
                      {u.name} · {u.email}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {audience === 'ORGS' ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm text-secondary">{t('compose.fields.orgs')}</legend>
              <div className="max-h-40 flex flex-col gap-1 overflow-y-auto zarva-scrollbar">
                {(orgsQ.data ?? []).map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={organizationIds.includes(o.id)}
                      onChange={() => toggleId(organizationIds, o.id, setOrganizationIds)}
                    />
                    <span className="truncate">{o.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
        </div>
        <footer className="flex shrink-0 justify-end gap-2 border-t border-border/60 px-4 py-3">
          <Button type="button" variant="ghost" onClick={close}>
            {t('compose.cancel')}
          </Button>
          <Button type="submit" disabled={create.isPending || levels.length === 0}>
            {create.isPending ? t('compose.sending') : t('compose.send')}
          </Button>
        </footer>
      </form>
    </div>
  );
}
