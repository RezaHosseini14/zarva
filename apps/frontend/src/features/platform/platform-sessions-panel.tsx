'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type {
  DeviceBanScope,
  IAuthLoginEvent,
  IDeviceBan,
  IPlatformSessionRow,
} from '@zarva/shared';

import { EmptyState } from '@/components/page/empty-state';
import { FilterSearch } from '@/components/page/filter-bar';
import { PageHeader } from '@/components/page/page-header';
import { SessionListSkeleton } from '@/components/page/session-list-skeleton';
import { apiFetch } from '@/lib/api';

import { PlatformBanDialog } from './platform-ban-dialog';
import { PlatformBanRow } from './platform-ban-row';
import { PlatformHistoryRow } from './platform-history-row';
import { PlatformSessionRow } from './platform-session-row';
import {
  PlatformSessionsNav,
  type PlatformSessionsTab,
} from './platform-sessions-nav';

export function PlatformSessionsPanel() {
  const t = useTranslations('platform.sessions');
  const tBans = useTranslations('platform.deviceBans');
  const locale = useLocale();
  const [tab, setTab] = useState<PlatformSessionsTab>('sessions');
  const [sessions, setSessions] = useState<IPlatformSessionRow[]>([]);
  const [history, setHistory] = useState<IAuthLoginEvent[]>([]);
  const [bans, setBans] = useState<IDeviceBan[]>([]);
  const [pending, startTransition] = useTransition();
  const [loadedTab, setLoadedTab] = useState<PlatformSessionsTab | null>(null);
  const [banTarget, setBanTarget] = useState<IPlatformSessionRow | null>(null);
  const [banScope, setBanScope] = useState<DeviceBanScope>('user');
  const [banReason, setBanReason] = useState('');
  const [q, setQ] = useState('');
  const loaded = loadedTab === tab;
  const isLoadingList =
    !loaded ||
    (pending &&
      ((tab === 'sessions' && sessions.length === 0) ||
        (tab === 'history' && history.length === 0) ||
        (tab === 'bans' && bans.length === 0)));

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const load = useCallback(() => {
    startTransition(async () => {
      if (tab === 'sessions') {
        const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
        setSessions(await apiFetch<IPlatformSessionRow[]>(`/platform/sessions${qs}`));
      } else if (tab === 'history') {
        const res = await apiFetch<{ items: IAuthLoginEvent[] }>(
          '/platform/login-history?page=1&pageSize=50',
        );
        setHistory(res.items);
      } else {
        setBans(await apiFetch<IDeviceBan[]>('/platform/device-bans'));
      }
      setLoadedTab(tab);
    });
  }, [tab, q]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = (id: string) => {
    startTransition(async () => {
      await apiFetch(`/platform/sessions/${id}`, { method: 'DELETE' });
      load();
    });
  };

  const submitBan = () => {
    if (!banTarget?.clientDeviceId) return;
    startTransition(async () => {
      await apiFetch('/platform/device-bans', {
        method: 'POST',
        body: {
          clientDeviceId: banTarget.clientDeviceId,
          scope: banScope,
          userId: banScope === 'user' ? banTarget.userId : undefined,
          reason: banReason || undefined,
        },
      });
      setBanTarget(null);
      setBanReason('');
      setBanScope('user');
      load();
    });
  };

  const liftBan = (id: string) => {
    startTransition(async () => {
      await apiFetch(`/platform/device-bans/${id}`, { method: 'DELETE' });
      load();
    });
  };

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />

      <PlatformSessionsNav value={tab} onChange={setTab} className="mb-5" />

      {tab === 'sessions' ? (
        <FilterSearch
          placeholder={t('search')}
          value={q}
          onChange={setQ}
          className="mb-4"
        />
      ) : null}

      {isLoadingList ? (
        <SessionListSkeleton />
      ) : tab === 'sessions' ? (
        sessions.length === 0 ? (
          <EmptyState
            bordered
            icon="shield-keyhole-bold"
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        ) : (
          <ul className="zarva-glass-card divide-y divide-border overflow-hidden p-0">
            {sessions.map((s) => (
              <PlatformSessionRow
                key={s.id}
                session={s}
                lastSeenLabel={dateFmt.format(new Date(s.lastSeenAt))}
                revokeLabel={t('revoke')}
                banLabel={tBans('ban')}
                pending={pending}
                onRevoke={revoke}
                onBan={setBanTarget}
              />
            ))}
          </ul>
        )
      ) : tab === 'history' ? (
        history.length === 0 ? (
          <EmptyState
            bordered
            icon="clipboard-list-bold"
            title={t('emptyHistoryTitle')}
            description={t('emptyHistoryDescription')}
          />
        ) : (
          <ul className="zarva-glass-card divide-y divide-border overflow-hidden p-0">
            {history.map((h) => (
              <PlatformHistoryRow
                key={h.id}
                event={h}
                whenLabel={dateFmt.format(new Date(h.createdAt))}
              />
            ))}
          </ul>
        )
      ) : bans.length === 0 ? (
        <EmptyState
          bordered
          icon="close-circle-bold"
          title={tBans('emptyTitle')}
          description={tBans('emptyDescription')}
        />
      ) : (
        <ul className="zarva-glass-card divide-y divide-border overflow-hidden p-0">
          {bans.map((b) => (
            <PlatformBanRow
              key={b.id}
              ban={b}
              scopeLabel={tBans(`scope.${b.scope}`)}
              unbanLabel={tBans('unban')}
              pending={pending}
              onUnban={liftBan}
            />
          ))}
        </ul>
      )}

      {banTarget ? (
        <PlatformBanDialog
          target={banTarget}
          scope={banScope}
          reason={banReason}
          pending={pending}
          labels={{
            title: tBans('banTitle'),
            scopeUser: tBans('scope.user'),
            scopeGlobal: tBans('scope.global'),
            reason: tBans('reason'),
            cancel: tBans('cancel'),
            confirm: tBans('confirm'),
          }}
          onScopeChange={setBanScope}
          onReasonChange={setBanReason}
          onCancel={() => setBanTarget(null)}
          onConfirm={submitBan}
        />
      ) : null}
    </>
  );
}
