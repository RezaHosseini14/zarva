'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import type { ISidebarNavAdminNode, ISidebarNavAdminResponse } from '@zarva/shared';
import { SIDEBAR_NAV_GROUPS } from '@zarva/shared';

import { DomainListPage } from '@/components/page/domain-list-page';
import { PageHeader } from '@/components/page/page-header';
import { StatusBadge } from '@/components/page/status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { toSidebarIconName } from '@/features/shell/sidebar-nav-icon';

import {
  createNavItemAction,
  deleteNavItemAction,
  updateNavItemAction,
} from './platform-navigation-actions';
import {
  EMPTY_NAV_FORM,
  NAV_PARENT_NONE,
  PlatformNavigationFormDialog,
  type INavFormState,
} from './platform-navigation-form-dialog';

interface IPlatformNavigationPanelProps {
  readonly data: ISidebarNavAdminResponse;
}

type INavRow = ISidebarNavAdminNode & { readonly depth: number };

function flatten(
  nodes: ReadonlyArray<ISidebarNavAdminNode>,
  depth = 0,
): INavRow[] {
  const out: INavRow[] = [];
  for (const node of nodes) {
    out.push({ ...node, depth });
    out.push(...flatten(node.children, depth + 1));
  }
  return out;
}

function groupLabelKey(groupId: string): string {
  return SIDEBAR_NAV_GROUPS.find((g) => g.id === groupId)?.labelKey ?? groupId;
}

function safeNavLabel(tNav: (key: string) => string, labelKey: string): string {
  try {
    return tNav(labelKey);
  } catch {
    return labelKey;
  }
}

export function PlatformNavigationPanel({ data }: IPlatformNavigationPanelProps) {
  const t = useTranslations('platformNavigation');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<INavFormState>(EMPTY_NAV_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => flatten(data.items), [data.items]);
  const activeCount = rows.filter((r) => r.isActive).length;
  const inactiveCount = rows.length - activeCount;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_NAV_FORM);
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_NAV_FORM);
    setError(null);
  };

  const refresh = () => {
    router.refresh();
  };

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const roles = form.roles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      const parentId = form.parentId === NAV_PARENT_NONE ? null : form.parentId;
      const body = {
        key: form.key,
        href: form.href,
        labelKey: form.labelKey,
        icon: form.icon,
        iconActive: form.iconActive,
        group: form.group,
        subject: form.subject,
        roles,
        moduleKey: form.moduleKey.trim() || null,
        parentId,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      const result = editingId
        ? await updateNavItemAction(editingId, {
            href: body.href,
            labelKey: body.labelKey,
            icon: body.icon,
            iconActive: body.iconActive,
            group: body.group,
            subject: body.subject,
            roles: body.roles,
            moduleKey: body.moduleKey,
            parentId: body.parentId,
            sortOrder: body.sortOrder,
            isActive: body.isActive,
          })
        : await createNavItemAction(body);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      closeForm();
      refresh();
    });
  };

  const onEdit = (node: INavRow) => {
    setEditingId(node.id);
    setForm({
      key: node.key,
      href: node.href,
      labelKey: node.labelKey,
      icon: node.icon,
      iconActive: node.iconActive,
      group: node.group,
      subject: node.subject,
      roles: node.roles.join(', '),
      moduleKey: node.moduleKey ?? '',
      parentId: node.parentId ?? NAV_PARENT_NONE,
      sortOrder: String(node.sortOrder),
      isActive: node.isActive,
    });
    setError(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    setError(null);
    startTransition(async () => {
      const result = await deleteNavItemAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (editingId === id) closeForm();
      refresh();
    });
  };

  const parentOptions = rows
    .filter((r) => r.id !== editingId)
    .map((p) => ({
      id: p.id,
      label: safeNavLabel(tNav, p.labelKey),
      href: p.href,
    }));

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Button
            type="button"
            className="h-9 min-h-9 px-4"
            onClick={openCreate}
          >
            <Icon name="add-circle-bold" className="text-base" />
            {t('create')}
          </Button>
        }
      />

      <DomainListPage
        chrome="body"
        shellTitle={t('title')}
        title={t('title')}
        description={t('description')}
        kpis={[
          {
            id: 'items',
            label: t('kpiItems'),
            value: String(rows.length),
            icon: 'settings-bold',
            accent: 'bg-primary/15 text-primary ring-primary/25',
          },
          {
            id: 'active',
            label: t('kpiActive'),
            value: String(activeCount),
            icon: 'check-read-bold',
            accent: 'bg-success/15 text-success ring-success/25',
          },
          {
            id: 'inactive',
            label: t('kpiInactive'),
            value: String(inactiveCount),
            icon: 'notes-bold',
            accent: 'bg-info/15 text-info ring-info/25',
          },
        ]}
        searchPlaceholder={t('search')}
        emptyTitle={t('emptyTitle')}
        emptyDescription={t('emptyDescription')}
        emptyIcon="settings-bold"
        emptyAccent="bg-primary/15 text-primary ring-primary/25"
        emptyActionLabel={t('create')}
        onEmptyAction={openCreate}
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          {
            id: 'label',
            header: t('colLabel'),
            cell: (r) => (
              <div
                className="flex min-w-0 items-center gap-2"
                style={{ paddingInlineStart: `${r.depth * 1.25}rem` }}
              >
                <Icon
                  name={toSidebarIconName(r.icon)}
                  className="shrink-0 text-lg text-primary"
                />
                <div className="min-w-0">
                  <span className="block truncate font-medium">
                    {safeNavLabel(tNav, r.labelKey)}
                  </span>
                  <span className="block truncate text-xs text-muted-fg">
                    {r.labelKey} · {r.key}
                  </span>
                </div>
              </div>
            ),
          },
          {
            id: 'href',
            header: t('colHref'),
            cell: (r) => <span className="font-mono text-xs">{r.href}</span>,
          },
          {
            id: 'group',
            header: t('colGroup'),
            cell: (r) => safeNavLabel(tNav, groupLabelKey(r.group)),
          },
          {
            id: 'subject',
            header: t('colSubject'),
            cell: (r) => r.subject,
          },
          {
            id: 'status',
            header: t('colStatus'),
            cell: (r) =>
              r.isActive ? (
                <StatusBadge
                  tone="success"
                  icon="check-read-bold"
                  label={t('statusActive')}
                />
              ) : (
                <StatusBadge
                  tone="neutral"
                  icon="notes-bold"
                  label={t('statusInactive')}
                />
              ),
          },
          {
            id: 'actions',
            header: t('colActions'),
            cell: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => onEdit(r)}
                >
                  {t('edit')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => setDeleteId(r.id)}
                >
                  {t('delete')}
                </Button>
              </div>
            ),
          },
        ]}
        footer={
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-fg">
            <span>
              {tCommon('total')}:{' '}
              <span className="zarva-num text-foreground">{rows.length}</span>
            </span>
          </div>
        }
      />

      <PlatformNavigationFormDialog
        open={formOpen}
        editing={editingId !== null}
        pending={pending}
        error={error}
        form={form}
        parentOptions={parentOptions}
        groupLabel={(id) => safeNavLabel(tNav, groupLabelKey(id))}
        onFormChange={setForm}
        onSubmit={onSubmit}
        onClose={closeForm}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="px-5 pt-5">
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
