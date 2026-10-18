import type { IconName } from '@/components/ui/icon';

const FALLBACK: IconName = 'settings-linear';

/** Cast API icon strings to known Solar names; unknown → settings-linear. */
export function toSidebarIconName(name: string): IconName {
  if (typeof name === 'string' && name.length > 0) {
    return name as IconName;
  }
  return FALLBACK;
}
