import { serverApiFetch } from '@/lib/auth/server-api';

import type { IPermissionRow, IRoleRow } from './roles.types';

export async function getRolesData(): Promise<{
  readonly roles: ReadonlyArray<IRoleRow>;
  readonly permissions: ReadonlyArray<IPermissionRow>;
}> {
  const [roles, permissions] = await Promise.all([
    serverApiFetch<ReadonlyArray<IRoleRow>>('/roles'),
    serverApiFetch<ReadonlyArray<IPermissionRow>>('/roles/permissions'),
  ]);
  return { roles, permissions };
}
