'use client';

import type { DeviceType, IAuthLoginEvent } from '@zarva/shared';

import { StatusBadge } from '@/components/page/status-badge';
import { Icon, type IconName } from '@/components/ui/icon';

function deviceIcon(type: DeviceType): IconName {
  if (type === 'mobile' || type === 'tablet') return 'user-id-bold';
  return 'plug-circle-bold';
}

interface ILoginHistoryRowProps {
  readonly event: IAuthLoginEvent;
  readonly whenLabel: string;
  readonly statusLabel: string;
  readonly isActive: boolean;
}

export function LoginHistoryRow({
  event,
  whenLabel,
  statusLabel,
  isActive,
}: ILoginHistoryRowProps) {
  const meta = [event.os, event.browser, event.ip].filter(Boolean).join(' · ');

  return (
    <li className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-nested/40 sm:px-5">
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-nested text-secondary ring-1 ring-border/70">
        <Icon name={deviceIcon(event.deviceType)} className="text-base" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="truncate text-sm font-medium text-foreground">{event.deviceName}</p>
          <time className="shrink-0 text-[11px] tabular-nums text-muted-fg">{whenLabel}</time>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <StatusBadge
            label={statusLabel}
            tone={isActive ? 'success' : 'neutral'}
            icon={isActive ? 'check-read-bold' : 'notes-bold'}
          />
          {meta ? <span className="truncate text-[11px] text-secondary">{meta}</span> : null}
        </div>
      </div>
    </li>
  );
}
