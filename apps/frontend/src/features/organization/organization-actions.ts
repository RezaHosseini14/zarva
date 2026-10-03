'use server';

import type { IOrgProfile } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type OrganizationActionResult =
  | { readonly ok: true; readonly profile: IOrgProfile }
  | { readonly ok: false; readonly error: string };

export async function updateOrganizationProfileAction(input: {
  readonly name: string;
  readonly taxId?: string;
  readonly phone?: string;
  readonly address?: string;
}): Promise<OrganizationActionResult> {
  try {
    const profile = await serverApiFetch<IOrgProfile>('/organization', {
      method: 'PUT',
      body: input,
    });
    return { ok: true, profile };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Update failed' };
  }
}
