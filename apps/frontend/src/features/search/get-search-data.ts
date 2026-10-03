import type { ISearchResult } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function searchGlobal(query: string): Promise<ISearchResult> {
  const q = encodeURIComponent(query.trim());
  return serverApiFetch(`/search?q=${q}`);
}
