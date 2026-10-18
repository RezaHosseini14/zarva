import type { IJewelryPieceRow, IJewelrySummary } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getJewelryPieces(): Promise<ReadonlyArray<IJewelryPieceRow>> {
  return serverApiFetch('/jewelry/pieces');
}

export async function getJewelrySummary(): Promise<IJewelrySummary> {
  return serverApiFetch('/jewelry/summary');
}
