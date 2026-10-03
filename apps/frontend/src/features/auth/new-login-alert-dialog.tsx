'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { DeviceType, IAuthSessionNewEvent } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';

interface IProps {
  readonly event: IAuthSessionNewEvent;
  readonly pending: boolean;
  readonly onConfirm: () => void;
  readonly onDeny: () => void;
}

function deviceIcon(type: DeviceType): IconName {
  if (type === 'mobile' || type === 'tablet') return 'user-id-bold';
  return 'plug-circle-bold';
}

export function NewLoginAlertDialog({ event, pending, onConfirm, onDeny }: IProps) {
  const t = useTranslations('auth.devices');
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onConfirm, pending]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="new-login-title"
      aria-describedby="new-login-desc"
    >
      <button
        type="button"
        aria-label={t('newLoginYes')}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        disabled={pending}
        onClick={() => {
          if (!pending) onConfirm();
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden zarva-glass-card shadow-xl ring-1 ring-warning/40">
        <header className="flex shrink-0 items-start gap-3 border-b border-border/60 px-5 py-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning ring-1 ring-warning/30">
            <Icon name="shield-keyhole-bold" className="text-2xl" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs font-medium text-warning">{t('newLoginEyebrow')}</p>
            <h2 id="new-login-title" className="text-lg font-semibold leading-snug tracking-tight text-foreground">
              {t('newLoginTitle')}
            </h2>
            <p id="new-login-desc" className="text-sm leading-relaxed text-secondary">
              {t('newLoginBody')}
            </p>
          </div>
        </header>

        <div className="px-5 py-4">
          <div className="rounded-xl bg-nested/55 p-3.5 ring-1 ring-border/60">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-nested text-secondary ring-1 ring-border/70">
                <Icon name={deviceIcon(event.deviceType)} className="text-lg" />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <MetaLine label={t('newLoginDevice')} value={event.deviceName} />
                <div className="h-px bg-border/60" />
                <MetaLine label={t('newLoginIp')} value={event.ip ?? '—'} mono />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-fg">{t('newLoginHint')}</p>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-4">
          <Button
            ref={confirmRef}
            type="button"
            variant="outline"
            size="lg"
            disabled={pending}
            className="w-full"
            onClick={onConfirm}
          >
            {t('newLoginYes')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={pending}
            className="w-full"
            onClick={onDeny}
          >
            <Icon name="logout-2-bold" className="text-base" />
            {pending ? t('newLoginDenying') : t('newLoginNo')}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function MetaLine({
  label,
  value,
  mono,
}: {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-fg">{label}</p>
      <p
        className={
          mono
            ? 'mt-0.5 truncate font-mono text-sm tabular-nums text-foreground'
            : 'mt-0.5 truncate text-sm font-medium tracking-tight text-foreground'
        }
      >
        {value}
      </p>
    </div>
  );
}
