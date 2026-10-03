'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { IAuthLoginEvent, IAuthSession } from '@zarva/shared';

import { EmptyState } from '@/components/page/empty-state';
import { ErrorState } from '@/components/page/error-state';
import { PageHeader } from '@/components/page/page-header';
import { SessionListSkeleton } from '@/components/page/session-list-skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiFetch } from '@/lib/api';

import { DeviceSessionRow } from './device-session-row';
import { LoginHistoryRow } from './login-history-row';

type Tab = 'active' | 'history';

export function AccountDevicesPage() {
  const t = useTranslations('auth.devices');
  const tHistory = useTranslations('auth.loginHistory');
  const locale = useLocale();
  const isRtl = locale !== 'en';
  const [tab, setTab] = useState<Tab>('active');
  const [sessions, setSessions] = useState<IAuthSession[]>([]);
  const [history, setHistory] = useState<IAuthLoginEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedTab, setLoadedTab] = useState<Tab | null>(null);
  const [pending, startTransition] = useTransition();
  const loaded = loadedTab === tab;

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        if (tab === 'active') {
          const res = await apiFetch<{ items: IAuthSession[] }>('/auth/sessions');
          setSessions(res.items);
        } else {
          const res = await apiFetch<{ items: IAuthLoginEvent[] }>(
            '/auth/sessions/history?page=1&pageSize=50',
          );
          setHistory(res.items);
        }
        setLoadedTab(tab);
      } catch {
        setError('load');
        setLoadedTab(tab);
      }
    });
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = (id: string) => {
    startTransition(async () => {
      await apiFetch(`/auth/sessions/${id}`, { method: 'DELETE' });
      load();
    });
  };

  const revokeOthers = () => {
    startTransition(async () => {
      await apiFetch('/auth/sessions/revoke-others', { method: 'POST', body: {} });
      load();
    });
  };

  const otherCount = sessions.filter((s) => !s.isCurrent).length;
  const isLoadingActive = !loaded || (pending && tab === 'active' && sessions.length === 0);
  const isLoadingHistory = !loaded || (pending && history.length === 0);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col text-start">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          tab === 'active' && otherCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={revokeOthers}
            >
              <Icon name="logout-2-bold" className="text-base" />
              {t('revokeOthers')}
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-4">
        <TabsList>
          <TabsTrigger value="active">
            <Icon name="shield-keyhole-bold" className="zarva-tabs-trigger-icon" />
            {t('activeTab')}
            {sessions.length > 0 ? (
              <span className="zarva-num ms-1.5 text-[11px] text-muted-fg">{sessions.length}</span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history">
            <Icon name="clipboard-list-bold" className="zarva-tabs-trigger-icon" />
            {tHistory('title')}
          </TabsTrigger>
        </TabsList>

        {error ? (
          <ErrorState title={t('errorTitle')} description={t('errorDescription')} />
        ) : null}

        <TabsContent value="active" className="mt-0 outline-none">
          {error ? null : isLoadingActive ? (
            <SessionListSkeleton />
          ) : sessions.length === 0 ? (
            <EmptyState
              bordered
              icon="shield-keyhole-bold"
              accent="bg-primary/15 text-primary ring-primary/25"
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          ) : (
            <ul className="zarva-glass-card divide-y divide-border overflow-hidden p-0">
              {sessions.map((s) => (
                <DeviceSessionRow
                  key={s.id}
                  session={s}
                  lastSeenLabel={t('lastSeen', {
                    when: dateFmt.format(new Date(s.lastSeenAt)),
                  })}
                  currentLabel={t('current')}
                  terminateLabel={t('terminate')}
                  pending={pending}
                  onTerminate={revoke}
                />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          {error ? null : isLoadingHistory ? (
            <SessionListSkeleton />
          ) : history.length === 0 ? (
            <EmptyState
              bordered
              icon="clipboard-list-bold"
              accent="bg-primary/15 text-primary ring-primary/25"
              title={tHistory('emptyTitle')}
              description={tHistory('emptyDescription')}
            />
          ) : (
            <ul className="zarva-glass-card divide-y divide-border overflow-hidden p-0">
              {history.map((h) => (
                <LoginHistoryRow
                  key={h.id}
                  event={h}
                  whenLabel={dateFmt.format(new Date(h.createdAt))}
                  statusLabel={
                    h.endReason
                      ? tHistory(`endReason.${h.endReason}` as 'endReason.logout')
                      : tHistory('active')
                  }
                  isActive={!h.endReason}
                />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
