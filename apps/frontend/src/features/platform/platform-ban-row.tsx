'use client';

import type { IDeviceBan } from '@zarva/shared';

import { StatusBadge } from '@/components/page/status-badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface IProps {
  readonly ban: IDeviceBan;
  readonly scopeLabel: string;
  readonly unbanLabel: string;
  readonly pending: boolean;
  readonly onUnban: (id: string) => void;
}

export function PlatformBanRow({
  ban,
  scopeLabel,
  unbanLabel,
  pending,
  onUnban,
}: IProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger ring-1 ring-danger/25">
        <Icon name="close-circle-bold" className="text-lg" />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate font-mono text-xs text-foreground">{ban.clientDeviceId}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge
            label={scopeLabel}
            tone={ban.scope === 'global' ? 'danger' : 'warning'}
            icon={ban.scope === 'global' ? 'global-bold' : 'user-id-bold'}
          />
          {ban.userEmail ? (
            <span className="text-xs text-secondary">{ban.userEmail}</span>
          ) : null}
          {ban.reason ? <span className="text-xs text-muted-fg">{ban.reason}</span> : null}
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        className="shrink-0 flex-row-reverse"
        onClick={() => onUnban(ban.id)}
      >
        {unbanLabel}
        <Icon name="refresh-bold" className="text-base" />
      </Button>
    </li>
  );
}
