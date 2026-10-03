'use client';

import { useMemo, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/page/empty-state';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { updateRolePermissionsAction } from '@/features/roles/roles-actions';
import { LOCKED_ROLES, type IPermissionRow, type IRoleRow } from '@/features/roles/roles.types';

interface IRolesWorkspaceProps {
  readonly initialRoles: ReadonlyArray<IRoleRow>;
  readonly initialPermissions: ReadonlyArray<IPermissionRow>;
}

function permissionLabel(
  key: string,
  t: ReturnType<typeof useTranslations<'roles'>>,
): string {
  const map: Record<string, string> = {
    'notifications.read': 'perm.notifications_read',
    'notifications.send': 'perm.notifications_send',
    'notifications.send.low': 'perm.notifications_send_low',
    'notifications.send.normal': 'perm.notifications_send_normal',
    'notifications.send.high': 'perm.notifications_send_high',
    'notifications.send.critical': 'perm.notifications_send_critical',
    'notifications.broadcast_platform': 'perm.notifications_broadcast_platform',
  };
  const msgKey = map[key];
  return msgKey ? t(msgKey as 'perm.notifications_read') : key;
}

export function RolesWorkspace({
  initialRoles,
  initialPermissions,
}: IRolesWorkspaceProps) {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [localRoles, setLocalRoles] = useState<ReadonlyArray<IRoleRow> | null>(null);
  const [rolesBaseline, setRolesBaseline] = useState(initialRoles);
  if (initialRoles !== rolesBaseline) {
    setRolesBaseline(initialRoles);
    setLocalRoles(null);
  }
  const roles = localRoles ?? initialRoles;
  const [editing, setEditing] = useState<IRoleRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    return initialPermissions.reduce<Record<string, IPermissionRow[]>>((acc, p) => {
      const list = acc[p.module] ?? [];
      list.push(p);
      acc[p.module] = list;
      return acc;
    }, {});
  }, [initialPermissions]);

  const openEdit = (role: IRoleRow) => {
    if (LOCKED_ROLES.has(role.name)) return;
    setSelected(new Set(role.permissions.map((rp) => rp.permission.id)));
    setSaveError(null);
    setEditing(role);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    if (!editing) return;
    setSaveError(null);
    startTransition(async () => {
      const result = await updateRolePermissionsAction({
        roleId: editing.id,
        permissionIds: [...selected],
        locale,
      });
      if (!result.ok) {
        setSaveError(t('saveError'));
        return;
      }
      setLocalRoles((prev) =>
        (prev ?? initialRoles).map((r) => (r.id === result.role.id ? result.role : r)),
      );
      setEditing(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="zarva-glass-card overflow-x-auto p-4 zarva-scrollbar">
          <h3 className="mb-3 text-sm font-medium">{t('title')}</h3>
          {roles.length === 0 ? (
            <EmptyState
              icon="shield-keyhole-bold"
              accent="bg-primary/15 text-primary ring-primary/25"
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              className="py-10"
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {roles.map((role) => {
                const locked = LOCKED_ROLES.has(role.name);
                return (
                  <li
                    key={role.id}
                    className="flex items-center justify-between gap-3 border-b border-border/50 py-2"
                  >
                    <span>{role.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-foreground/50">
                        {role.permissions.length} {t('permissions')}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-8 px-2 text-xs"
                        disabled={locked}
                        onClick={() => openEdit(role)}
                      >
                        {locked ? t('locked') : t('edit')}
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="zarva-glass-card max-h-[70vh] overflow-y-auto p-4 zarva-scrollbar">
          <h3 className="mb-3 text-sm font-medium">{t('permissions')}</h3>
          {Object.entries(grouped).map(([module, items]) => (
            <div key={module} className="mb-4">
              <p className="text-xs uppercase tracking-wide text-primary">{module}</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                {items.map((p) => (
                  <li key={p.id} className="min-h-9 flex items-center">
                    {permissionLabel(p.key, t)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={tCommon('close')}
            onClick={() => setEditing(null)}
          />
          <div className="zarva-glass-card relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col sm:mx-4">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <h2 className="text-base font-semibold">
                {t('editTitle', { name: editing.name })}
              </h2>
              <button
                type="button"
                className="text-secondary hover:text-foreground"
                onClick={() => setEditing(null)}
              >
                <Icon name="close-circle-bold" className="text-xl" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 zarva-scrollbar">
              {Object.entries(grouped).map(([module, items]) => (
                <div key={module} className="mb-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-primary">{module}</p>
                  <ul className="space-y-1.5">
                    {items.map((p) => (
                      <li key={p.id}>
                        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                          />
                          <span>{permissionLabel(p.key, t)}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {saveError ? <p className="text-sm text-danger">{saveError}</p> : null}
            </div>
            <footer className="flex shrink-0 justify-end gap-2 border-t border-border/60 px-4 py-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {tCommon('cancel')}
              </Button>
              <Button type="button" disabled={pending} onClick={save}>
                {pending ? tCommon('loading') : tCommon('save')}
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
