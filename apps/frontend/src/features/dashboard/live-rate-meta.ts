import type { LiveRateId } from '@zarva/shared';

import type { IconName } from '@/components/ui/icon';

export const LIVE_RATE_META: Record<
  LiveRateId,
  { readonly icon: IconName; readonly accent: string }
> = {
  xau_usd: {
    icon: 'global-bold',
    accent: 'bg-primary/15 text-primary ring-primary/25',
  },
  iran_gold_24k: {
    icon: 'crown-bold',
    accent: 'bg-primary/20 text-accent ring-primary/30',
  },
  iran_gold_18k: {
    icon: 'medal-star-bold',
    accent: 'bg-warning/15 text-warning ring-warning/25',
  },
  usd_irr: {
    icon: 'dollar-bold',
    accent: 'bg-success/15 text-success ring-success/25',
  },
};
