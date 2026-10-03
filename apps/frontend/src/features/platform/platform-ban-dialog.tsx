'use client';

import type { DeviceBanScope, IPlatformSessionRow } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ILabels {
  readonly title: string;
  readonly scopeUser: string;
  readonly scopeGlobal: string;
  readonly reason: string;
  readonly cancel: string;
  readonly confirm: string;
}

interface IProps {
  readonly target: IPlatformSessionRow;
  readonly scope: DeviceBanScope;
  readonly reason: string;
  readonly pending: boolean;
  readonly labels: ILabels;
  readonly onScopeChange: (scope: DeviceBanScope) => void;
  readonly onReasonChange: (reason: string) => void;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function PlatformBanDialog({
  target,
  scope,
  reason,
  pending,
  labels,
  onScopeChange,
  onReasonChange,
  onCancel,
  onConfirm,
}: IProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="zarva-glass-card w-full max-w-md p-5 shadow-xl">
        <h3 className="text-base font-semibold tracking-tight">{labels.title}</h3>
        <p className="mt-1.5 text-sm text-secondary">
          {target.deviceName}
          <span className="text-muted-fg"> · {target.userEmail}</span>
        </p>
        <div className="mt-5 space-y-3">
          <Select value={scope} onValueChange={(v) => onScopeChange(v as DeviceBanScope)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{labels.scopeUser}</SelectItem>
              <SelectItem value="global">{labels.scopeGlobal}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={labels.reason}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel}>
              {labels.cancel}
            </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  className="flex-row-reverse"
                  onClick={onConfirm}
                >
                  {labels.confirm}
                  <Icon name="danger-triangle-bold" className="text-base" />
                </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
