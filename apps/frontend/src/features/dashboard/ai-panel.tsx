import { DashboardPanel } from './dashboard-panel';

interface IAiPanelProps {
  readonly title: string;
  readonly body: string;
}

export function AiPanel({ title, body }: IAiPanelProps) {
  return (
    <DashboardPanel
      title={title}
      icon="stars-bold"
      accent="bg-accent/15 text-accent ring-accent/25"
      className="flex h-full min-h-[22rem] flex-col sm:min-h-[24rem]"
      bodyClassName="flex flex-1 flex-col"
    >
      <p className="flex-1 text-sm leading-relaxed text-secondary">{body}</p>
    </DashboardPanel>
  );
}
