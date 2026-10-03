import type { IOrgSettingSection } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getSettingsSection(section: string): Promise<IOrgSettingSection> {
  return serverApiFetch(`/settings/${encodeURIComponent(section)}`);
}
