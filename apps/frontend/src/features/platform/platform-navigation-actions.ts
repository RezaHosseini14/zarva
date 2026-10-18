'use server';

import type { ISidebarNavAdminResponse } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type PlatformNavActionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export async function getAdminNavigation(): Promise<ISidebarNavAdminResponse> {
  return serverApiFetch<ISidebarNavAdminResponse>('/platform/navigation');
}

export async function createNavItemAction(body: {
  readonly key: string;
  readonly href: string;
  readonly labelKey: string;
  readonly icon: string;
  readonly iconActive: string;
  readonly group: string;
  readonly subject: string;
  readonly roles?: ReadonlyArray<string>;
  readonly moduleKey?: string | null;
  readonly parentId?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}): Promise<PlatformNavActionResult> {
  try {
    await serverApiFetch('/platform/navigation', { method: 'POST', body });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Create failed' };
  }
}

export async function updateNavItemAction(
  id: string,
  body: Record<string, unknown>,
): Promise<PlatformNavActionResult> {
  try {
    await serverApiFetch(`/platform/navigation/${id}`, { method: 'PATCH', body });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Update failed' };
  }
}

export async function deleteNavItemAction(id: string): Promise<PlatformNavActionResult> {
  try {
    await serverApiFetch(`/platform/navigation/${id}`, { method: 'DELETE' });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Delete failed' };
  }
}
