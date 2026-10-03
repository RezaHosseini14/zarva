export type DeviceBanScope = 'user' | 'global';

export type AuthLoginEndReason =
  | 'logout'
  | 'revoked_by_user'
  | 'revoked_by_admin'
  | 'replaced'
  | 'denied_not_me'
  | 'banned'
  | 'expired';

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface IAuthSession {
  readonly id: string;
  readonly familyId: string;
  readonly clientDeviceId: string | null;
  readonly deviceName: string;
  readonly deviceType: DeviceType;
  readonly os: string | null;
  readonly browser: string | null;
  readonly label: string | null;
  readonly ip: string | null;
  readonly lastSeenAt: string;
  readonly createdAt: string;
  readonly isCurrent: boolean;
}

export interface IAuthLoginEvent {
  readonly id: string;
  readonly userId: string;
  readonly organizationId: string;
  readonly familyId: string | null;
  readonly clientDeviceId: string | null;
  readonly deviceName: string;
  readonly deviceType: DeviceType;
  readonly os: string | null;
  readonly browser: string | null;
  readonly ip: string | null;
  readonly createdAt: string;
  readonly endedAt: string | null;
  readonly endReason: AuthLoginEndReason | null;
  readonly userName?: string;
  readonly userEmail?: string;
  readonly organizationName?: string;
}

export interface IDeviceBan {
  readonly id: string;
  readonly clientDeviceId: string;
  readonly scope: DeviceBanScope;
  readonly userId: string | null;
  readonly organizationId: string | null;
  readonly reason: string | null;
  readonly bannedById: string;
  readonly bannedByName: string | null;
  readonly createdAt: string;
  readonly liftedAt: string | null;
  readonly userName?: string | null;
  readonly userEmail?: string | null;
  readonly organizationName?: string | null;
}

export interface IDeviceLimitErrorBody {
  readonly statusCode: 409;
  readonly code: 'DEVICE_LIMIT';
  readonly message: string;
  readonly sessions: ReadonlyArray<IAuthSession>;
}

export interface IOrgSecurityPolicy {
  readonly maxDevicesPerUser: number | null;
}

export interface IPlatformSessionRow extends IAuthSession {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly organizationId: string;
  readonly organizationName: string;
}

export interface ICreateDeviceBanRequest {
  readonly clientDeviceId: string;
  readonly scope: DeviceBanScope;
  readonly userId?: string;
  readonly reason?: string;
}

export interface IAuthSessionNewEvent {
  readonly sessionId: string;
  readonly familyId: string;
  readonly clientDeviceId: string | null;
  readonly deviceName: string;
  readonly deviceType: DeviceType;
  readonly ip: string | null;
  readonly createdAt: string;
}

export interface IAuthSessionRevokedEvent {
  readonly familyId: string;
  readonly sessionId: string;
  readonly reason: AuthLoginEndReason;
}
