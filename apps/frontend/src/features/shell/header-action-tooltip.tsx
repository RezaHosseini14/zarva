'use client';

import type { ReactElement } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IHeaderActionTooltipProps {
  readonly label: string;
  readonly children: ReactElement;
  /** Hide tooltip while a dropdown is open. */
  readonly disabled?: boolean;
}

export function HeaderActionTooltip({
  label,
  children,
  disabled = false,
}: IHeaderActionTooltipProps) {
  return (
    <Tooltip open={disabled ? false : undefined}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
