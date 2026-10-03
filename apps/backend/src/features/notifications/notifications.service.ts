import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ICreateNotificationRequest,
  INotificationInboxItem,
  INotificationOrgOption,
  INotificationReadEvent,
  INotificationReceipt,
  INotificationReceiptsResult,
  INotificationRecipientUser,
  INotificationSentItem,
  INotificationUnreadCount,
  IPaginatedResult,
  NotificationAudience,
  NotificationPriority,
} from '@zarva/shared';
import {
  NotificationAudience as PrismaAudience,
  NotificationPriority as PrismaPriority,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { NotificationsGateway } from './notifications.gateway';
import {
  canBroadcastPlatformNotification,
  canSendOrgNotification,
  canSendPriority,
} from './notifications.permissions';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async listInbox(
    user: IAuthUser,
    page = 1,
    pageSize = 20,
  ): Promise<IPaginatedResult<INotificationInboxItem>> {
    this.assertCanRead(user);
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.notificationRecipient.count({ where: { userId: user.id } }),
      this.prisma.notificationRecipient.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          notification: {
            include: { createdBy: { select: { name: true } } },
          },
        },
      }),
    ]);

    return {
      items: rows.map((row) => this.toInboxItem(row)),
      total,
      page: Math.max(page, 1),
      pageSize: take,
    };
  }

  async unreadCount(user: IAuthUser): Promise<INotificationUnreadCount> {
    this.assertCanRead(user);
    const count = await this.prisma.notificationRecipient.count({
      where: { userId: user.id, readAt: null },
    });
    return { count };
  }

  async listPendingCritical(user: IAuthUser): Promise<ReadonlyArray<INotificationInboxItem>> {
    this.assertCanRead(user);
    const rows = await this.prisma.notificationRecipient.findMany({
      where: {
        userId: user.id,
        acknowledgedAt: null,
        notification: { priority: PrismaPriority.CRITICAL },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        notification: {
          include: { createdBy: { select: { name: true } } },
        },
      },
    });
    return rows.map((row) => this.toInboxItem(row));
  }

  async acknowledge(user: IAuthUser, recipientId: string): Promise<INotificationInboxItem> {
    this.assertCanRead(user);
    const row = await this.prisma.notificationRecipient.findFirst({
      where: { id: recipientId, userId: user.id },
      include: {
        notification: {
          include: { createdBy: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (row.notification.priority !== PrismaPriority.CRITICAL) {
      throw new BadRequestException('Only CRITICAL notifications require acknowledgement');
    }
    if (row.acknowledgedAt) {
      return this.toInboxItem(row);
    }
    const now = new Date();
    const updated = await this.prisma.notificationRecipient.update({
      where: { id: row.id },
      data: {
        acknowledgedAt: now,
        readAt: row.readAt ?? now,
      },
      include: {
        notification: {
          include: { createdBy: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    if (!row.readAt) {
      this.emitReadEvent(updated);
    }
    return this.toInboxItem(updated);
  }

  async markRead(user: IAuthUser, recipientId: string): Promise<INotificationInboxItem> {
    this.assertCanRead(user);
    const row = await this.prisma.notificationRecipient.findFirst({
      where: { id: recipientId, userId: user.id },
      include: {
        notification: {
          include: { createdBy: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (!row.readAt) {
      const updated = await this.prisma.notificationRecipient.update({
        where: { id: row.id },
        data: { readAt: new Date() },
        include: {
          notification: {
            include: { createdBy: { select: { id: true, name: true } } },
          },
          user: { select: { id: true, name: true } },
        },
      });
      this.emitReadEvent(updated);
      return this.toInboxItem(updated);
    }
    return this.toInboxItem(row);
  }

  async markAllRead(user: IAuthUser): Promise<{ updated: number }> {
    this.assertCanRead(user);
    const unread = await this.prisma.notificationRecipient.findMany({
      where: { userId: user.id, readAt: null },
      include: {
        notification: {
          include: { createdBy: { select: { id: true, name: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });
    if (unread.length === 0) {
      return { updated: 0 };
    }
    const now = new Date();
    await this.prisma.notificationRecipient.updateMany({
      where: { id: { in: unread.map((r) => r.id) } },
      data: { readAt: now },
    });
    for (const row of unread) {
      this.emitReadEvent({
        ...row,
        readAt: now,
      });
    }
    return { updated: unread.length };
  }

  async listSent(
    user: IAuthUser,
    page = 1,
    pageSize = 20,
  ): Promise<IPaginatedResult<INotificationSentItem>> {
    this.assertCanSendOrg(user);
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { createdById: user.id } }),
      this.prisma.notification.findMany({
        where: { createdById: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          _count: {
            select: {
              recipients: true,
            },
          },
          recipients: {
            where: { readAt: { not: null } },
            select: { id: true },
          },
        },
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        audience: row.audience as NotificationAudience,
        priority: row.priority as NotificationPriority,
        createdAt: row.createdAt.toISOString(),
        recipientCount: row._count.recipients,
        readCount: row.recipients.length,
      })),
      total,
      page: Math.max(page, 1),
      pageSize: take,
    };
  }

  async getReceipts(
    user: IAuthUser,
    notificationId: string,
  ): Promise<INotificationReceiptsResult> {
    this.assertCanSendOrg(user);
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        recipients: {
          orderBy: [{ readAt: 'desc' }, { createdAt: 'asc' }],
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.createdById !== user.id) {
      throw new ForbiddenException('Only the author can view receipts');
    }

    const recipients: INotificationReceipt[] = notification.recipients.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      email: r.user.email,
      organizationId: r.organizationId,
      readAt: r.readAt ? r.readAt.toISOString() : null,
    }));
    const readCount = recipients.filter((r) => r.readAt !== null).length;

    return {
      notificationId: notification.id,
      title: notification.title,
      recipients,
      readCount,
      total: recipients.length,
    };
  }

  async listRecipientUsers(
    user: IAuthUser,
    organizationId?: string,
  ): Promise<ReadonlyArray<INotificationRecipientUser>> {
    const canPlatform = canBroadcastPlatformNotification(user);
    const orgId = canPlatform && organizationId ? organizationId : user.organizationId;
    if (!canPlatform && organizationId && organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot list users outside your organization');
    }
    if (!canSendOrgNotification(user)) {
      throw new ForbiddenException('Missing notifications.send');
    }

    const users = await this.prisma.user.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, organizationId: true },
    });
    return users;
  }

  async listOrganizations(user: IAuthUser): Promise<ReadonlyArray<INotificationOrgOption>> {
    if (!canBroadcastPlatformNotification(user)) {
      throw new ForbiddenException('Missing notifications.broadcast_platform');
    }
    return this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async create(
    user: IAuthUser,
    dto: ICreateNotificationRequest,
  ): Promise<{ id: string; recipientCount: number }> {
    const priority: NotificationPriority = dto.priority ?? 'NORMAL';
    if (!canSendPriority(user, priority)) {
      throw new ForbiddenException(`Missing permission to send ${priority} notifications`);
    }

    const recipients = await this.resolveRecipients(user, dto);
    if (recipients.length === 0) {
      throw new BadRequestException('No recipients resolved');
    }

    return this.persistAndEmit(user.id, user.organizationId, dto, priority, recipients);
  }

  /**
   * System-originated notification (billing expiry, etc.).
   * Uses a platform SUPER_ADMIN as author when available.
   */
  async createSystemNotification(input: {
    readonly organizationId: string;
    readonly userIds: ReadonlyArray<string>;
    readonly title: string;
    readonly body: string;
    readonly priority?: NotificationPriority;
    readonly type?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
  }): Promise<{ id: string; recipientCount: number }> {
    const author =
      (await this.prisma.user.findFirst({
        where: { role: { name: 'SUPER_ADMIN' } },
        select: { id: true },
      })) ??
      (await this.prisma.user.findFirst({
        where: { organizationId: input.organizationId },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      }));

    if (!author) {
      throw new BadRequestException('No system author available');
    }

    const targets = await this.prisma.user.findMany({
      where: {
        id: { in: [...input.userIds] },
        organizationId: input.organizationId,
      },
      select: { id: true, organizationId: true },
    });

    if (targets.length === 0) {
      throw new BadRequestException('No recipients resolved');
    }

    return this.persistAndEmit(
      author.id,
      input.organizationId,
      {
        title: input.title,
        body: input.body,
        audience: 'USERS',
        userIds: targets.map((t) => t.id),
      },
      input.priority ?? 'HIGH',
      targets.map((t) => ({ userId: t.id, organizationId: t.organizationId })),
      input.type,
      input.metadata,
    );
  }

  private async persistAndEmit(
    createdById: string,
    organizationId: string | null,
    dto: Pick<ICreateNotificationRequest, 'title' | 'body' | 'audience' | 'organizationIds' | 'userIds'>,
    priority: NotificationPriority,
    recipients: ReadonlyArray<{ userId: string; organizationId: string }>,
    type?: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<{ id: string; recipientCount: number }> {
    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title.trim(),
        body: dto.body.trim(),
        audience: (dto.audience ?? 'USERS') as PrismaAudience,
        priority: priority as PrismaPriority,
        type: type ?? null,
        metadata: metadata
          ? (JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue)
          : undefined,
        organizationId:
          dto.audience === 'PLATFORM_ALL' || dto.audience === 'ORGS'
            ? null
            : organizationId,
        targetOrgIds: dto.organizationIds ? [...dto.organizationIds] : undefined,
        createdById,
        recipients: {
          create: recipients.map((r) => ({
            userId: r.userId,
            organizationId: r.organizationId,
          })),
        },
      },
      include: {
        createdBy: { select: { name: true } },
        recipients: true,
      },
    });

    const createdAt = notification.createdAt.toISOString();
    const createdRecipients = notification.recipients;
    const createdByName = notification.createdBy.name;
    for (const recipient of createdRecipients) {
      const payload: INotificationInboxItem = {
        id: recipient.id,
        notificationId: notification.id,
        title: notification.title,
        body: notification.body,
        audience: notification.audience as NotificationAudience,
        priority: notification.priority as NotificationPriority,
        isUnread: true,
        createdAt,
        createdByName,
        type: notification.type,
        metadata: (notification.metadata as Record<string, unknown> | null) ?? null,
      };
      try {
        this.gateway.emitToUser(recipient.userId, payload);
      } catch {
        // Persist succeeded; realtime is best-effort.
      }
    }

    return { id: notification.id, recipientCount: createdRecipients.length };
  }

  private async resolveRecipients(
    user: IAuthUser,
    dto: ICreateNotificationRequest,
  ): Promise<ReadonlyArray<{ userId: string; organizationId: string }>> {
    const audience = dto.audience;

    if (audience === 'USERS') {
      this.assertCanSendOrg(user);
      const userIds = dto.userIds ?? [];
      if (userIds.length === 0) {
        throw new BadRequestException('userIds required for USERS audience');
      }
      const targets = await this.prisma.user.findMany({
        where: {
          id: { in: [...userIds] },
          organizationId: user.organizationId,
        },
        select: { id: true, organizationId: true },
      });
      if (targets.length !== userIds.length) {
        throw new BadRequestException('Some users are outside your organization');
      }
      return targets.map((t) => ({ userId: t.id, organizationId: t.organizationId }));
    }

    if (audience === 'ORG_ALL') {
      this.assertCanSendOrg(user);
      const targets = await this.prisma.user.findMany({
        where: { organizationId: user.organizationId },
        select: { id: true, organizationId: true },
      });
      if (targets.length === 0) {
        throw new BadRequestException('No users in your organization');
      }
      return targets.map((t) => ({ userId: t.id, organizationId: t.organizationId }));
    }

    if (audience === 'ORGS') {
      this.assertCanBroadcastPlatform(user);
      const orgIds = dto.organizationIds ?? [];
      if (orgIds.length === 0) {
        throw new BadRequestException('organizationIds required for ORGS audience');
      }
      const orgs = await this.prisma.organization.findMany({
        where: { id: { in: [...orgIds] } },
        select: { id: true },
      });
      if (orgs.length !== orgIds.length) {
        throw new BadRequestException('Some organizations were not found');
      }
      const targets = await this.prisma.user.findMany({
        where: { organizationId: { in: [...orgIds] } },
        select: { id: true, organizationId: true },
      });
      if (targets.length === 0) {
        throw new BadRequestException('No users in selected organizations');
      }
      return targets.map((t) => ({ userId: t.id, organizationId: t.organizationId }));
    }

    if (audience === 'PLATFORM_ALL') {
      this.assertCanBroadcastPlatform(user);
      const targets = await this.prisma.user.findMany({
        select: { id: true, organizationId: true },
      });
      if (targets.length === 0) {
        throw new BadRequestException('No recipients resolved');
      }
      return targets.map((t) => ({ userId: t.id, organizationId: t.organizationId }));
    }

    throw new BadRequestException('Invalid audience');
  }

  private toInboxItem(row: {
    id: string;
    readAt: Date | null;
    createdAt: Date;
    notification: {
      id: string;
      title: string;
      body: string;
      audience: PrismaAudience;
      priority: PrismaPriority;
      type: string | null;
      metadata: unknown;
      createdAt: Date;
      createdBy: { name: string };
    };
  }): INotificationInboxItem {
    return {
      id: row.id,
      notificationId: row.notification.id,
      title: row.notification.title,
      body: row.notification.body,
      audience: row.notification.audience as NotificationAudience,
      priority: row.notification.priority as NotificationPriority,
      isUnread: row.readAt === null,
      createdAt: row.notification.createdAt.toISOString(),
      createdByName: row.notification.createdBy.name,
      type: row.notification.type,
      metadata: (row.notification.metadata as Record<string, unknown> | null) ?? null,
    };
  }

  private emitReadEvent(row: {
    id: string;
    readAt: Date | null;
    user: { id: string; name: string };
    notification: {
      id: string;
      createdBy: { id: string; name: string };
    };
  }): void {
    if (!row.readAt) {
      return;
    }
    const payload: INotificationReadEvent = {
      notificationId: row.notification.id,
      recipientId: row.id,
      userId: row.user.id,
      userName: row.user.name,
      readAt: row.readAt.toISOString(),
    };
    try {
      this.gateway.emitReadToAuthor(row.notification.createdBy.id, payload);
    } catch {
      // Realtime is best-effort.
    }
  }

  private assertCanRead(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN' ||
      user.permissions.includes('notifications.read')
    ) {
      return;
    }
    throw new ForbiddenException('Missing notifications.read');
  }

  private assertCanSendOrg(user: IAuthUser): void {
    if (!canSendOrgNotification(user)) {
      throw new ForbiddenException('Missing notifications.send');
    }
  }

  private assertCanBroadcastPlatform(user: IAuthUser): void {
    if (!canBroadcastPlatformNotification(user)) {
      throw new ForbiddenException('Missing notifications.broadcast_platform');
    }
  }
}
