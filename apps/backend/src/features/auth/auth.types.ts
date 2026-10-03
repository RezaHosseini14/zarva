import type { IUser } from '@zarva/shared';

export interface IAuthUser extends IUser {
  readonly sessionId?: string;
}

export interface IJwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly organizationId: string;
  readonly roleName: string;
  readonly permissions: string[];
  readonly branchId: string | null;
  readonly locale: string;
  readonly name: string;
  /** Refresh-session family — used for realtime kick targeting. */
  readonly familyId?: string;
}
