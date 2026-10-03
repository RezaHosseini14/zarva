import type { IJewelryPieceRow } from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

export async function getJewelryPieces(): Promise<ReadonlyArray<IJewelryPieceRow>> {
  return serverApiFetch('/jewelry/pieces');
}
