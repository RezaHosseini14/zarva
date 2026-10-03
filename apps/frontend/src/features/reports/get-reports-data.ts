import { cache } from 'react';
import type { IReportDto } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export type ReportKind = 'sales' | 'purchases' | 'inventory' | 'gold' | 'profit';

export const getReport = cache(async (kind: ReportKind): Promise<IReportDto> => {
  return serverApiFetch<IReportDto>(`/reports/${kind}`);
});
