import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface IHubCard {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
  /** Dashboard-style square accent, e.g. `bg-primary/15 text-primary ring-primary/25` */
  readonly accent?: string;
}

interface IHubCardsProps {
  readonly items: ReadonlyArray<IHubCard>;
}

const DEFAULT_ACCENT = 'bg-primary/15 text-primary ring-primary/25';

export function HubCards({ items }: IHubCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'zarva-glass-card group relative flex items-center gap-3 px-3.5 py-3',
            'transition-[border-color,box-shadow] duration-(--duration-shell)',
            'hover:border-primary/40 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 rounded-[inherit] opacity-0',
              'bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_58%)]',
              'transition-opacity duration-(--duration-shell) group-hover:opacity-100',
              'rtl:bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_58%)]',
            )}
          />

          <span
            className={cn(
              'relative inline-flex size-9 shrink-0 items-center justify-center rounded-[0.85rem] ring-1',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]',
              'transition-[box-shadow,transform] duration-(--duration-shell)',
              'group-hover:scale-[1.04] group-hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_22%,transparent),0_8px_18px_color-mix(in_oklab,var(--primary)_18%,transparent)]',
              item.accent ?? DEFAULT_ACCENT,
            )}
          >
            {item.icon}
          </span>

          <div className="relative min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-none tracking-tight text-foreground transition-colors duration-(--duration-shell) group-hover:text-primary">
              {item.title}
            </span>
            <p className="mt-1.5 line-clamp-1 text-xs leading-snug text-secondary">
              {item.description}
            </p>
          </div>

          <span
            className={cn(
              'relative inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
              'text-muted-fg opacity-40',
              'transition-[opacity,color,background-color,transform] duration-(--duration-shell)',
              'group-hover:bg-primary/12 group-hover:text-primary group-hover:opacity-100',
              'group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5',
            )}
          >
            <Icon
              name="alt-arrow-down-bold"
              className="-rotate-90 text-sm leading-none rtl:rotate-90"
            />
          </span>
        </Link>
      ))}
    </div>
  );
}
