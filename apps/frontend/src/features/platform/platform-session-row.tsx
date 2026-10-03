'use client';

import type { IPlatformSessionRow } from '@zarva/shared';

import { StatusBadge } from '@/components/page/status-badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface IProps {
  readonly session: IPlatformSessionRow;
  readonly lastSeenLabel: string;
  readonly revokeLabel: string;
  readonly banLabel: string;
  readonly pending: boolean;
  readonly onRevoke: (id: string) => void;
  readonly onBan: (session: IPlatformSessionRow) => void;
}

export function PlatformSessionRow({
  session,
  lastSeenLabel,
  revokeLabel,
  banLabel,
  pending,
  onRevoke,
  onBan,
}: IProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Icon name="plug-circle-bold" className="text-lg" />
      </span>

      <div className="min-w-0 flex-1 text-start">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{session.deviceName}</p>
          <StatusBadge
            label={session.organizationName}
            tone="gold"
            icon="buildings-2-bold"
          />
        </div>
        <p className="mt-1 truncate text-xs text-secondary">
          {session.userName} · {session.userEmail}
        </p>
        <p className="mt-1 text-[11px] text-muted-fg">
          <span className="font-mono tabular-nums">{session.ip ?? '—'}</span>
          {' · '}
          {lastSeenLabel}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          className="flex-row-reverse"
          onClick={() => onRevoke(session.id)}
        >
          {revokeLabel}
          <Icon name="logout-2-bold" className="text-base" />
        </Button>
        {session.clientDeviceId ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            className="flex-row-reverse text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => onBan(session)}
          >
            {banLabel}
            <Icon name="danger-triangle-bold" className="text-base" />
          </Button>
        ) : null}
      </div>
    </li>
  );
}
