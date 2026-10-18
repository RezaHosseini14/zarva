import type {
  IArtisanRow,
  IProductionBatchRow,
  IWorkshopOrderRow,
  IWorkshopSummary,
} from '@zarva/shared';

import { serverApiFetch } from '@/lib/auth/server-api';

async function fetchWorkshopList<T>(path: string): Promise<ReadonlyArray<T>> {
  const data = await serverApiFetch<ReadonlyArray<T>>(path);
  return Array.isArray(data) ? data : [];
}

export async function getWorkshopOrders(): Promise<ReadonlyArray<IWorkshopOrderRow>> {
  return fetchWorkshopList<IWorkshopOrderRow>('/workshop/orders');
}

export async function getWorkshopArtisans(): Promise<ReadonlyArray<IArtisanRow>> {
  return fetchWorkshopList<IArtisanRow>('/workshop/artisans');
}

export async function getWorkshopProduction(): Promise<ReadonlyArray<IProductionBatchRow>> {
  return fetchWorkshopList<IProductionBatchRow>('/workshop/production');
}

export async function getWorkshopSummary(): Promise<IWorkshopSummary> {
  return serverApiFetch('/workshop/summary');
}
