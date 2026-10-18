import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type {
  AuthLoginEndReason,
  DeviceBanScope,
  DeviceType,
  IAuthLoginEvent,
  IAuthSession,
  IAuthSessionNewEvent,
  IAuthSessionRevokedEvent,
  IDeviceBan,
  IOrgSecurityPolicy,
  IPlatformSessionRow,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { parseUserAgent } from './device-meta.util';
import { SessionLivenessCache } from './session-liveness.cache';

export interface IIssueDeviceContext {
  readonly clientDeviceId?: string | null;
  readonly userAgent?: string | null;
  readonly ip?: string | null;
  readonly revokeSessionId?: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly gateway: NotificationsGateway,
    private readonly liveness: SessionLivenessCache,
  ) {}

  async getOrgMaxDevices(organizationId: string): Promise<number | null> {
    const row = await this.prisma.orgSetting.findUnique({
      where: {
        organizationId_section: { organizationId, section: 'security' },
      },
    });
    const raw = (row?.values as Record<string, string> | null)?.maxDevicesPerUser;
    if (raw == null || raw === '' || raw === '0') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }

  async getSecurityPolicy(organizationId: string): Promise<IOrgSecurityPolicy> {
    return { maxDevicesPerUser: await this.getOrgMaxDevices(organizationId) };
  }

  async setSecurityPolicy(
    organizationId: string,
    maxDevicesPerUser: number | null,
  ): Promise<IOrgSecurityPolicy> {
    const existing = await this.prisma.orgSetting.findUnique({
      where: {
        organizationId_section: { organizationId, section: 'security' },
      },
    });
    const values: Record<string, string> = {
      ...((existing?.values as Record<string, string> | null) ?? {}),
    };
    if (maxDevicesPerUser == null || maxDevicesPerUser <= 0) {
      delete values.maxDevicesPerUser;
    } else {
      values.maxDevicesPerUser = String(Math.floor(maxDevicesPerUser));
    }
    await this.prisma.orgSetting.upsert({
      where: {
        organizationId_section: { organizationId, section: 'security' },
      },
      create: { organizationId, section: 'security', values },
      update: { values },
    });
    return { maxDevicesPerUser: await this.getOrgMaxDevices(organizationId) };
  }

  async assertDeviceAllowed(userId: string, clientDeviceId: string | null | undefined): Promise<void> {
    if (!clientDeviceId) return;
    const bans = await this.prisma.deviceBan.findMany({
      where: {
        liftedAt: null,
        clientDeviceId,
        OR: [{ scope: 'global' }, { scope: 'user', userId }],
      },
      take: 1,
    });
    if (bans.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          code: 'DEVICE_BANNED',
          message: 'This device is banned',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async listActiveForUser(userId: string, currentFamilyId?: string | null): Promise<IAuthSession[]> {
    const rows = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
    });
    return rows.map((r) => this.toSessionDto(r, currentFamilyId));
  }

  async listHistoryForUser(
    userId: string,
    page = 1,
    pageSize = 30,
  ): Promise<{ items: IAuthLoginEvent[]; total: number; page: number; pageSize: number }> {
    const skip = (Math.max(1, page) - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.prisma.authLoginEvent.count({ where: { userId } }),
      this.prisma.authLoginEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);
    return {
      items: rows.map((r) => this.toLoginEventDto(r)),
      total,
      page: Math.max(1, page),
      pageSize,
    };
  }

  async resolveCurrentFamilyId(userId: string, refreshToken?: string | null): Promise<string | null> {
    if (!refreshToken) return null;
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash } });
    if (!session || session.userId !== userId || session.revokedAt) return null;
    return session.familyId;
  }

  async prepareNewSession(
    userId: string,
    organizationId: string,
    ctx: IIssueDeviceContext,
  ): Promise<{
    readonly familyId: string;
    readonly isNewDevice: boolean;
    readonly meta: ReturnType<typeof parseUserAgent> & {
      readonly clientDeviceId: string | null;
      readonly ip: string | null;
      readonly userAgent: string | null;
    };
  }> {
    await this.assertDeviceAllowed(userId, ctx.clientDeviceId);
    const parsed = parseUserAgent(ctx.userAgent);
    const clientDeviceId = ctx.clientDeviceId?.trim() || null;
    const ip = ctx.ip ?? null;
    const userAgent = ctx.userAgent ?? null;

    if (ctx.revokeSessionId) {
      await this.revokeSessionInternal(userId, ctx.revokeSessionId, 'replaced', false);
    }

    if (clientDeviceId) {
      const existing = await this.prisma.refreshSession.findFirst({
        where: {
          userId,
          clientDeviceId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastSeenAt: 'desc' },
      });
      if (existing) {
        await this.revokeFamily(existing.familyId, 'replaced');
        return {
          familyId: existing.familyId,
          isNewDevice: false,
          meta: { ...parsed, clientDeviceId, ip, userAgent },
        };
      }
    }

    const max = await this.getOrgMaxDevices(organizationId);
    if (max != null) {
      const active = await this.prisma.refreshSession.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      if (active.length >= max) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            code: 'DEVICE_LIMIT',
            message: 'Device limit reached',
            sessions: active.map((r) => this.toSessionDto(r, null)),
          },
          HttpStatus.CONFLICT,
        );
      }
    }

    return {
      familyId: randomUUID(),
      isNewDevice: true,
      meta: { ...parsed, clientDeviceId, ip, userAgent },
    };
  }

  async afterSessionCreated(input: {
    readonly userId: string;
    readonly organizationId: string;
    readonly sessionId: string;
    readonly familyId: string;
    readonly isNewDevice: boolean;
    readonly meta: {
      readonly clientDeviceId: string | null;
      readonly deviceName: string;
      readonly deviceType: DeviceType;
      readonly os: string | null;
      readonly browser: string | null;
      readonly ip: string | null;
      readonly userAgent: string | null;
    };
  }): Promise<void> {
    await this.prisma.authLoginEvent.create({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        familyId: input.familyId,
        clientDeviceId: input.meta.clientDeviceId,
        deviceName: input.meta.deviceName,
        deviceType: input.meta.deviceType,
        os: input.meta.os,
        browser: input.meta.browser,
        ip: input.meta.ip,
        userAgent: input.meta.userAgent,
      },
    });

    // Notify other live devices whenever a concurrent session exists
    // (not only first-seen clientDeviceId — re-login on another browser must alert too).
    const otherLive = await this.prisma.refreshSession.count({
      where: {
        userId: input.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        familyId: { not: input.familyId },
      },
    });
    if (otherLive === 0) return;

    const createdAt = new Date().toISOString();
    const event: IAuthSessionNewEvent = {
      sessionId: input.sessionId,
      familyId: input.familyId,
      clientDeviceId: input.meta.clientDeviceId,
      deviceName: input.meta.deviceName,
      deviceType: input.meta.deviceType,
      ip: input.meta.ip,
      createdAt,
    };
    this.gateway.emitAuthEvent(input.userId, 'auth.session.new', event);

    try {
      await this.notifications.createSystemNotification({
        organizationId: input.organizationId,
        userIds: [input.userId],
        title: 'New login detected',
        body: `New login from ${input.meta.deviceName}${input.meta.ip ? ` (${input.meta.ip})` : ''}`,
        priority: 'HIGH',
        type: 'auth.new_login',
        metadata: {
          sessionId: input.sessionId,
          familyId: input.familyId,
          clientDeviceId: input.meta.clientDeviceId,
          deviceName: input.meta.deviceName,
          ip: input.meta.ip,
          createdAt,
        },
      });
    } catch {
      // best-effort
    }
  }

  async touchFamily(familyId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { lastSeenAt: new Date() },
    });
  }

  markFamilyLive(familyId: string): void {
    this.liveness.markLive(familyId);
  }

  markFamilyRevoked(familyId: string): void {
    this.liveness.markRevoked(familyId);
  }

  async revokeSessionForUser(
    userId: string,
    sessionId: string,
    reason: AuthLoginEndReason = 'revoked_by_user',
  ): Promise<{ ok: true }> {
    await this.revokeSessionInternal(userId, sessionId, reason, true);
    return { ok: true };
  }

  async denySession(userId: string, sessionId: string): Promise<{ ok: true }> {
    return this.revokeSessionForUser(userId, sessionId, 'denied_not_me');
  }

  async revokeOthers(userId: string, currentFamilyId: string): Promise<{ ok: true; count: number }> {
    const others = await this.prisma.refreshSession.findMany({
      where: {
        userId,
        revokedAt: null,
        familyId: { not: currentFamilyId },
      },
    });
    const families = [...new Set(others.map((s) => s.familyId))];
    for (const familyId of families) {
      await this.revokeFamily(familyId, 'revoked_by_user');
    }
    return { ok: true, count: families.length };
  }

  async logoutCurrent(
    userId: string,
    refreshToken: string | undefined,
  ): Promise<{ familyId: string | null }> {
    if (!refreshToken) {
      return { familyId: null };
    }
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });
    if (!session || session.userId !== userId) {
      return { familyId: null };
    }
    await this.revokeFamily(session.familyId, 'logout');
    return { familyId: session.familyId };
  }

  async renameSession(
    userId: string,
    sessionId: string,
    label: string | null,
  ): Promise<IAuthSession> {
    const session = await this.prisma.refreshSession.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
    });
    if (!session) throw new NotFoundException('Session not found');
    const updated = await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { label: label?.trim() || null },
    });
    return this.toSessionDto(updated, session.familyId);
  }

  async platformListSessions(filters: {
    readonly organizationId?: string;
    readonly userId?: string;
    readonly q?: string;
  }): Promise<IPlatformSessionRow[]> {
    const rows = await this.prisma.refreshSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
        ...(filters.userId ? { userId: filters.userId } : {}),
        user: {
          ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
          ...(filters.q
            ? {
                OR: [
                  { email: { contains: filters.q, mode: 'insensitive' } },
                  { name: { contains: filters.q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      },
      include: {
        user: { include: { organization: { select: { id: true, name: true } } } },
      },
      orderBy: { lastSeenAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => ({
      ...this.toSessionDto(r, null),
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      organizationId: r.user.organizationId,
      organizationName: r.user.organization.name,
    }));
  }

  async platformListHistory(filters: {
    readonly organizationId?: string;
    readonly userId?: string;
    readonly from?: string;
    readonly to?: string;
    readonly page?: number;
    readonly pageSize?: number;
  }): Promise<{ items: IAuthLoginEvent[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 30));
    const where = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.authLoginEvent.count({ where }),
      this.prisma.authLoginEvent.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      items: rows.map((r) => ({
        ...this.toLoginEventDto(r),
        userName: r.user.name,
        userEmail: r.user.email,
        organizationName: r.organization.name,
      })),
      total,
      page,
      pageSize,
    };
  }

  async platformRevokeSession(sessionId: string): Promise<{ ok: true }> {
    const session = await this.prisma.refreshSession.findUnique({ where: { id: sessionId } });
    if (!session || session.revokedAt) throw new NotFoundException('Session not found');
    await this.revokeFamily(session.familyId, 'revoked_by_admin');
    return { ok: true };
  }

  async createBan(input: {
    readonly clientDeviceId: string;
    readonly scope: DeviceBanScope;
    readonly userId?: string;
    readonly reason?: string;
    readonly bannedById: string;
  }): Promise<IDeviceBan> {
    const clientDeviceId = input.clientDeviceId.trim();
    if (!clientDeviceId) throw new BadRequestException('clientDeviceId required');

    let userId: string | null = null;
    let organizationId: string | null = null;
    if (input.scope === 'user') {
      if (!input.userId) throw new BadRequestException('userId required for user-scope ban');
      const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) throw new NotFoundException('User not found');
      userId = user.id;
      organizationId = user.organizationId;
    }

    const existing = await this.prisma.deviceBan.findFirst({
      where: {
        liftedAt: null,
        clientDeviceId,
        ...(input.scope === 'global'
          ? { scope: 'global' }
          : { scope: 'user', userId: userId! }),
      },
    });
    if (existing) throw new BadRequestException('Active ban already exists');

    const ban = await this.prisma.deviceBan.create({
      data: {
        clientDeviceId,
        scope: input.scope,
        userId,
        organizationId,
        reason: input.reason?.trim() || null,
        bannedById: input.bannedById,
      },
      include: {
        bannedBy: { select: { name: true } },
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        clientDeviceId,
        revokedAt: null,
        ...(input.scope === 'user' ? { userId: userId! } : {}),
      },
    });
    const families = [...new Set(sessions.map((s) => s.familyId))];
    for (const familyId of families) {
      await this.revokeFamily(familyId, 'banned');
    }

    return this.toBanDto(ban);
  }

  async listBans(): Promise<IDeviceBan[]> {
    const rows = await this.prisma.deviceBan.findMany({
      where: { liftedAt: null },
      include: {
        bannedBy: { select: { name: true } },
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => this.toBanDto(r));
  }

  async liftBan(banId: string, liftedById: string): Promise<IDeviceBan> {
    const ban = await this.prisma.deviceBan.findUnique({
      where: { id: banId },
      include: {
        bannedBy: { select: { name: true } },
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });
    if (!ban) throw new NotFoundException('Ban not found');
    if (ban.liftedAt) throw new BadRequestException('Ban already lifted');
    const updated = await this.prisma.deviceBan.update({
      where: { id: banId },
      data: { liftedAt: new Date(), liftedById },
      include: {
        bannedBy: { select: { name: true } },
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });
    return this.toBanDto(updated);
  }

  private async revokeSessionInternal(
    userId: string,
    sessionId: string,
    reason: AuthLoginEndReason,
    emit: boolean,
  ): Promise<void> {
    const session = await this.prisma.refreshSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    await this.revokeFamily(session.familyId, reason, emit);
  }

  private async revokeFamily(
    familyId: string,
    reason: AuthLoginEndReason,
    emit = true,
  ): Promise<void> {
    const sessions = await this.prisma.refreshSession.findMany({
      where: { familyId, revokedAt: null },
    });
    const anySession =
      sessions[0] ??
      (await this.prisma.refreshSession.findFirst({
        where: { familyId },
        orderBy: { createdAt: 'desc' },
      }));

    if (sessions.length > 0) {
      const now = new Date();
      await this.prisma.refreshSession.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: now },
      });
    }
    this.liveness.markRevoked(familyId);
    await this.closeLoginEvents(familyId, reason);

    if (emit && anySession) {
      const payload: IAuthSessionRevokedEvent = {
        familyId,
        sessionId: anySession.id,
        reason,
      };
      this.gateway.emitSessionRevoked(anySession.userId, payload);
    }
  }

  private async closeLoginEvents(familyId: string, reason: AuthLoginEndReason): Promise<void> {
    await this.prisma.authLoginEvent.updateMany({
      where: { familyId, endedAt: null },
      data: { endedAt: new Date(), endReason: reason },
    });
  }

  private toSessionDto(
    row: {
      id: string;
      familyId: string;
      clientDeviceId: string | null;
      deviceName: string | null;
      deviceType: string | null;
      os: string | null;
      browser: string | null;
      label: string | null;
      ip: string | null;
      lastSeenAt: Date;
      createdAt: Date;
    },
    currentFamilyId: string | null | undefined,
  ): IAuthSession {
    return {
      id: row.id,
      familyId: row.familyId,
      clientDeviceId: row.clientDeviceId,
      deviceName: row.deviceName ?? row.label ?? 'Unknown device',
      deviceType: (row.deviceType as DeviceType) ?? 'unknown',
      os: row.os,
      browser: row.browser,
      label: row.label,
      ip: row.ip,
      lastSeenAt: row.lastSeenAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      isCurrent: currentFamilyId != null && row.familyId === currentFamilyId,
    };
  }

  private toLoginEventDto(row: {
    id: string;
    userId: string;
    organizationId: string;
    familyId: string | null;
    clientDeviceId: string | null;
    deviceName: string | null;
    deviceType: string | null;
    os: string | null;
    browser: string | null;
    ip: string | null;
    createdAt: Date;
    endedAt: Date | null;
    endReason: string | null;
  }): IAuthLoginEvent {
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      familyId: row.familyId,
      clientDeviceId: row.clientDeviceId,
      deviceName: row.deviceName ?? 'Unknown device',
      deviceType: (row.deviceType as DeviceType) ?? 'unknown',
      os: row.os,
      browser: row.browser,
      ip: row.ip,
      createdAt: row.createdAt.toISOString(),
      endedAt: row.endedAt?.toISOString() ?? null,
      endReason: (row.endReason as AuthLoginEndReason | null) ?? null,
    };
  }

  private toBanDto(row: {
    id: string;
    clientDeviceId: string;
    scope: DeviceBanScope;
    userId: string | null;
    organizationId: string | null;
    reason: string | null;
    bannedById: string;
    createdAt: Date;
    liftedAt: Date | null;
    bannedBy?: { name: string } | null;
    user?: { name: string; email: string } | null;
    organization?: { name: string } | null;
  }): IDeviceBan {
    return {
      id: row.id,
      clientDeviceId: row.clientDeviceId,
      scope: row.scope,
      userId: row.userId,
      organizationId: row.organizationId,
      reason: row.reason,
      bannedById: row.bannedById,
      bannedByName: row.bannedBy?.name ?? null,
      createdAt: row.createdAt.toISOString(),
      liftedAt: row.liftedAt?.toISOString() ?? null,
      userName: row.user?.name ?? null,
      userEmail: row.user?.email ?? null,
      organizationName: row.organization?.name ?? null,
    };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
