import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/page/empty-state';
import { DashboardPanel } from './dashboard-panel';

interface IActivityItem {
  readonly id: string;
  readonly title: string;
  readonly time: string;
  readonly icon?: IconName;
  readonly accent?: string;
}

interface IActivityListProps {
  readonly title: string;
  readonly items: ReadonlyArray<IActivityItem>;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

const DEFAULT_ITEM_ACCENT = 'bg-nested text-muted-fg ring-border/60';

export function ActivityList({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: IActivityListProps) {
  return (
    <DashboardPanel
      title={title}
      icon="clipboard-list-bold"
      accent="bg-info/15 text-info ring-info/25"
    >
      {items.length === 0 ? (
        <EmptyState
          icon="clipboard-list-bold"
          accent="bg-info/15 text-info ring-info/25"
          title={emptyTitle ?? title}
          description={emptyDescription ?? ''}
          className="py-8"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1',
                    item.accent ?? DEFAULT_ITEM_ACCENT,
                  )}
                >
                  <Icon name={item.icon ?? 'bill-list-bold'} className="text-base" />
                </span>
                <span className="truncate text-foreground">{item.title}</span>
              </div>
              <span className="zarva-num shrink-0 rounded-full bg-nested px-2.5 py-1 text-xs text-muted-fg">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
