import type { IDashboardInsight } from '@zarva/shared';

import { DashboardPanel } from './dashboard-panel';

interface IAiPanelProps {
  readonly title: string;
  readonly insights: ReadonlyArray<IDashboardInsight>;
  readonly emptyBody: string;
}

export function AiPanel({ title, insights, emptyBody }: IAiPanelProps) {
  return (
    <DashboardPanel
      title={title}
      icon="stars-bold"
      accent="bg-accent/15 text-accent ring-accent/25"
      className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
      bodyClassName="flex flex-1 flex-col gap-3"
    >
      {insights.length === 0 ? (
        <p className="flex-1 text-sm leading-relaxed text-secondary">{emptyBody}</p>
      ) : (
        <ul className="flex flex-1 flex-col gap-3">
          {insights.map((item) => (
            <li key={item.id} className="border-b border-border/40 pb-2 last:border-0">
              <p className="text-sm font-medium text-primary">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
