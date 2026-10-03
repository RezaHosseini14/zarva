import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface IZarvaAppCanvasProps {
  readonly className?: string;
  readonly children: ReactNode;
}

/** Static app surface — solid/gradient CSS only (no WebGL / animated mesh). */
export function ZarvaAppCanvas({ className, children }: IZarvaAppCanvasProps) {
  return <div className={cn('zarva-app-canvas', className)}>{children}</div>;
}
