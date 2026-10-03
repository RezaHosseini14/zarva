'use server';

import { revalidatePath } from 'next/cache';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

import type { IRoleRow } from './roles.types';

export type UpdateRolePermissionsResult =
  | { readonly ok: true; readonly role: IRoleRow }
  | { readonly ok: false; readonly error: string };

export async function updateRolePermissionsAction(input: {
  readonly roleId: string;
  readonly permissionIds: ReadonlyArray<string>;
  readonly locale: string;
}): Promise<UpdateRolePermissionsResult> {
  try {
    const role = await serverApiFetch<IRoleRow>(
      `/roles/${input.roleId}/permissions`,
      {
        method: 'PUT',
        body: { permissionIds: input.permissionIds },
      },
    );
    revalidatePath(`/${input.locale}/roles`);
    revalidatePath(`/${input.locale}/organization/roles`);
    return { ok: true, role };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Save failed' };
  }
}
