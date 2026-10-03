import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DomainNotificationPublisher {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async notifyOrgUsers(input: {
    readonly organizationId: string;
    readonly title: string;
    readonly body: string;
    readonly priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  }): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { organizationId: input.organizationId },
      select: { id: true },
      take: 50,
    });
    if (users.length === 0) return;
    await this.notifications.createSystemNotification({
      organizationId: input.organizationId,
      userIds: users.map((u) => u.id),
      title: input.title,
      body: input.body,
      priority: input.priority ?? 'NORMAL',
    });
  }
}
