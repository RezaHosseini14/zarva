'use client';

import type { DeviceType, IAuthSession } from '@zarva/shared';

import { StatusBadge } from '@/components/page/status-badge';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

function deviceIcon(type: DeviceType): IconName {
  if (type === 'mobile' || type === 'tablet') return 'user-id-bold';
  return 'plug-circle-bold';
}

interface IDeviceSessionRowProps {
  readonly session: IAuthSession;
  readonly lastSeenLabel: string;
  readonly currentLabel: string;
  readonly terminateLabel: string;
  readonly pending: boolean;
  readonly onTerminate: (id: string) => void;
}

export function DeviceSessionRow({
  session,
  lastSeenLabel,
  currentLabel,
  terminateLabel,
  pending,
  onTerminate,
}: IDeviceSessionRowProps) {
  const meta = [session.os, session.browser, session.ip].filter(Boolean).join(' · ');

  return (
    <li
      className={cn(
        'flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5',
        'hover:bg-nested/40',
        session.isCurrent && 'border-s-2 border-s-primary bg-primary/4',
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
            session.isCurrent
              ? 'bg-primary/15 text-primary ring-primary/30'
              : 'bg-nested text-secondary ring-border/70',
          )}
        >
          <Icon name={deviceIcon(session.deviceType)} className="text-lg" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium tracking-tight text-foreground">
              {session.label || session.deviceName}
            </p>
            {session.isCurrent ? (
              <StatusBadge label={currentLabel} tone="gold" icon="crown-star-bold" />
            ) : null}
          </div>
          {meta ? <p className="mt-1 truncate text-xs text-secondary">{meta}</p> : null}
          <p className="mt-1 text-[11px] text-muted-fg">{lastSeenLabel}</p>
        </div>
      </div>

      {!session.isCurrent ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          className="shrink-0 self-start text-danger hover:bg-danger/10 hover:text-danger sm:self-center"
          onClick={() => onTerminate(session.id)}
        >
          <Icon name="logout-2-bold" className="text-base" />
          {terminateLabel}
        </Button>
      ) : null}
    </li>
  );
}
