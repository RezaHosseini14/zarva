'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { NotificationPriorityBadge } from './notification-priority-badge';
import {
  useNotificationMutations,
  usePendingCriticalNotifications,
} from './use-notifications';

function formatNotificationTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' });
  if (absSec < 45) return rtf.format(0, 'second');
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (absSec < 86_400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  return rtf.format(Math.round(diffSec / 86_400), 'day');
}

export function NotificationsCriticalGate() {
  const t = useTranslations('modules.notifications');
  const locale = useLocale();
  const pendingQ = usePendingCriticalNotifications();
  const { acknowledge } = useNotificationMutations();
  const [ackedIds, setAckedIds] = useState<ReadonlySet<string>>(() => new Set());
  const btnRef = useRef<HTMLButtonElement>(null);

  const queue = (pendingQ.data ?? []).filter((item) => !ackedIds.has(item.id));
  const current = queue[0] ?? null;

  useEffect(() => {
    if (current) {
      btnRef.current?.focus();
    }
  }, [current]);

  if (!current) return null;

  const onAck = async () => {
    try {
      await acknowledge.mutateAsync(current.id);
      setAckedIds((prev) => new Set([...prev, current.id]));
    } catch {
      // keep modal open
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="notify-critical-title"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div className="notify-critical-card zarva-glass-card relative z-10 flex max-h-[min(90vh,32rem)] w-full max-w-lg flex-col overflow-hidden ring-1 ring-danger/40">
        <header className="flex shrink-0 items-start gap-3 border-b border-border/60 px-5 py-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger ring-1 ring-danger/30">
            <Icon name="shield-keyhole-bold" className="text-2xl" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <NotificationPriorityBadge priority="CRITICAL" />
              <span className="text-xs font-medium text-danger">{t('critical.eyebrow')}</span>
            </div>
            <h2 id="notify-critical-title" className="text-lg font-semibold leading-snug text-foreground">
              {current.title}
            </h2>
            <p className="text-xs text-secondary">
              {current.createdByName ?? '—'} · {formatNotificationTime(current.createdAt, locale)}
            </p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 zarva-scrollbar">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{current.body}</p>
        </div>
        <footer className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-4">
          {queue.length > 1 ? (
            <p className="text-center text-xs text-secondary">
              {t('critical.queue', { current: 1, total: queue.length })}
            </p>
          ) : null}
          <Button
            ref={btnRef}
            type="button"
            className="w-full bg-danger text-white ring-danger/40 hover:bg-danger/90"
            disabled={acknowledge.isPending}
            onClick={() => void onAck()}
          >
            {acknowledge.isPending ? t('critical.acking') : t('critical.ack')}
          </Button>
        </footer>
      </div>
    </div>
  );
}
