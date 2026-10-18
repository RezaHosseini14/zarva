export interface IApiResponse<TData> {
  readonly data: TData;
  readonly message?: string;
}

export interface IApiError {
  readonly statusCode: number;
  readonly message: string;
  readonly error?: string;
}

export interface IPaginatedResult<TItem> {
  readonly items: ReadonlyArray<TItem>;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface IHealthResponse {
  readonly status: 'ok';
  readonly version: string;
  readonly timestamp: string;
}

export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly name: string;
  readonly roleName: string;
  readonly permissions: ReadonlyArray<string>;
  readonly organizationId: string;
  readonly branchId: string | null;
  readonly locale: string;
}

export interface IOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly themePreset: string;
}

export interface IThemeTokens {
  readonly preset: string;
  readonly primary: string;
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
  readonly muted: string;
  readonly card: string;
  readonly border: string;
}

export type DashboardKpiUnit = 'million' | 'kg' | 'count' | 'percent';

export type DashboardKpiDeltaUnit = 'percent' | 'count';

export interface IDashboardKpi {
  readonly id: string;
  readonly labelKey: string;
  readonly value: number;
  readonly unit: DashboardKpiUnit;
  readonly delta: number;
  readonly deltaUnit: DashboardKpiDeltaUnit;
  readonly trend: 'up' | 'down' | 'flat';
}

export interface IDashboardOverview {
  readonly kpis: ReadonlyArray<IDashboardKpi>;
  readonly forecast: ReadonlyArray<{ readonly label: string; readonly value: number }>;
  readonly activity: ReadonlyArray<{
    readonly id: string;
    readonly titleKey: string;
    readonly time: string;
  }>;
}

export interface IDashboardInsight {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly severity: 'info' | 'warning' | 'critical';
}

export type LiveRateId = 'xau_usd' | 'iran_gold_24k' | 'iran_gold_18k' | 'usd_irr';

export type LiveRateTrend = 'up' | 'down' | 'flat';

export type LiveRateStatus = 'live' | 'stale' | 'unavailable';

export interface ILiveRate {
  readonly id: LiveRateId;
  readonly price: number;
  readonly currency: 'USD' | 'IRT';
  readonly unit: 'oz' | 'gram' | 'usd';
  readonly changeAmount: number;
  readonly changePercent: number;
  readonly tickTrend: LiveRateTrend;
  readonly dayTrend: LiveRateTrend;
  readonly updatedAt: string;
  readonly status: LiveRateStatus;
}

export interface ILiveRatesResponse {
  readonly rates: ReadonlyArray<ILiveRate>;
  readonly polledAt: string;
}

export interface IPermissionCatalogItem {
  readonly id: string;
  readonly key: string;
  readonly module: string;
}

export interface IRole {
  readonly id: string;
  readonly name: string;
  readonly isSystem: boolean;
  readonly permissionIds: ReadonlyArray<string>;
}

export type NotificationAudience = 'USERS' | 'ORG_ALL' | 'ORGS' | 'PLATFORM_ALL';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export const NOTIFICATION_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'CRITICAL',
] as const satisfies ReadonlyArray<NotificationPriority>;

export interface INotificationInboxItem {
  readonly id: string;
  readonly notificationId: string;
  readonly title: string;
  readonly body: string;
  readonly audience: NotificationAudience;
  readonly priority: NotificationPriority;
  readonly isUnread: boolean;
  readonly createdAt: string;
  readonly createdByName: string | null;
  readonly type?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
}

export interface INotificationUnreadCount {
  readonly count: number;
}

export interface ICreateNotificationRequest {
  readonly title: string;
  readonly body: string;
  readonly audience: NotificationAudience;
  readonly priority?: NotificationPriority;
  readonly userIds?: ReadonlyArray<string>;
  readonly organizationIds?: ReadonlyArray<string>;
}

export interface INotificationRecipientUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly organizationId: string;
}

export interface INotificationOrgOption {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface INotificationSentItem {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly audience: NotificationAudience;
  readonly priority: NotificationPriority;
  readonly createdAt: string;
  readonly recipientCount: number;
  readonly readCount: number;
}

export interface INotificationReceipt {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly organizationId: string;
  readonly readAt: string | null;
}

export interface INotificationReceiptsResult {
  readonly notificationId: string;
  readonly title: string;
  readonly recipients: ReadonlyArray<INotificationReceipt>;
  readonly readCount: number;
  readonly total: number;
}

export interface INotificationReadEvent {
  readonly notificationId: string;
  readonly recipientId: string;
  readonly userId: string;
  readonly userName: string;
  readonly readAt: string;
}
