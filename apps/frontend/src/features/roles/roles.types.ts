export interface IRoleRow {
  readonly id: string;
  readonly name: string;
  readonly permissions: ReadonlyArray<{
    readonly permission: { readonly id: string; readonly key: string };
  }>;
}

export interface IPermissionRow {
  readonly id: string;
  readonly key: string;
  readonly module: string;
}

export const LOCKED_ROLES = new Set(['SUPER_ADMIN', 'PLATFORM_ADMIN']);
