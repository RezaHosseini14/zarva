'use client';

import type { IAuthLoginEvent } from '@zarva/shared';

import { Icon } from '@/components/ui/icon';

interface IProps {
  readonly event: IAuthLoginEvent;
  readonly whenLabel: string;
}

export function PlatformHistoryRow({ event, whenLabel }: IProps) {
  const meta = [event.userEmail, event.ip, event.endReason].filter(Boolean).join(' · ');

  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-nested text-secondary ring-1 ring-border/70">
        <Icon name="plug-circle-bold" className="text-base" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="truncate text-sm font-medium text-foreground">
            {event.deviceName}
            <span className="ms-2 font-normal text-secondary">
              {event.organizationName} · {event.userName}
            </span>
          </p>
          <time className="shrink-0 text-[11px] tabular-nums text-muted-fg">{whenLabel}</time>
        </div>
        {meta ? <p className="mt-1 truncate text-xs text-muted-fg">{meta}</p> : null}
      </div>
    </li>
  );
}
