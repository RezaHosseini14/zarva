import { cache } from 'react';
import type { ISidebarNavigationResponse } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export const getShellNavigation = cache(async (): Promise<ISidebarNavigationResponse> => {
  return serverApiFetch<ISidebarNavigationResponse>('/navigation');
});
