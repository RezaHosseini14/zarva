import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

const ALERT_KIND = 'expiry_7d';

@Injectable()
export class SubscriptionLifecycleService {
  private readonly logger = new Logger(SubscriptionLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async runDaily(): Promise<void> {
    await this.expireEndedSubscriptions();
    await this.warnExpiringSoon();
  }

  async expireEndedSubscriptions(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.subscription.updateMany({
      where: {
        status: { in: ['active', 'trialing'] },
        currentPeriodEnd: { lt: now },
      },
      data: { status: 'expired' },
    });
    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} subscription(s)`);
    }
    return result.count;
  }

  async warnExpiringSoon(): Promise<number> {
    const warnDays = Number(this.config.get('SUBSCRIPTION_EXPIRY_WARN_DAYS') ?? 7);
    const now = new Date();
    const horizon = new Date(now.getTime() + warnDays * 86_400_000);

    const subs = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing', 'past_due'] },
        currentPeriodEnd: { gte: now, lte: horizon },
      },
      include: {
        organization: { select: { id: true, name: true } },
        plan: { select: { name: true } },
      },
    });

    let sent = 0;
    for (const sub of subs) {
      if (!sub.currentPeriodEnd) {
        continue;
      }

      const already = await this.prisma.subscriptionAlert.findUnique({
        where: {
          organizationId_kind_periodEnd: {
            organizationId: sub.organizationId,
            kind: ALERT_KIND,
            periodEnd: sub.currentPeriodEnd,
          },
        },
      });
      if (already) {
        continue;
      }

      const admins = await this.findOrgAdmins(sub.organizationId);
      if (admins.length === 0) {
        this.logger.warn(`No ORG_ADMIN for org ${sub.organizationId}`);
        continue;
      }

      const endIso = sub.currentPeriodEnd.toISOString().slice(0, 10);
      const title = 'Subscription expiring soon';
      const body = `Your ${sub.plan.name} plan for ${sub.organization.name} expires on ${endIso}. Renew to avoid interruption.`;

      let inAppOk = false;
      let emailOk = false;

      try {
        await this.notifications.createSystemNotification({
          organizationId: sub.organizationId,
          userIds: admins.map((a) => a.id),
          title,
          body,
          priority: 'HIGH',
        });
        inAppOk = true;
      } catch (err) {
        this.logger.warn(`In-app expiry alert failed: ${String(err)}`);
      }

      for (const admin of admins) {
        const ok = await this.email.send({
          to: admin.email,
          subject: `[ZARVA] ${title}`,
          text: body,
          html: `<p>${body}</p><p><a href="${this.config.get('APP_URL') ?? 'http://localhost:3100'}/settings/billing">Manage billing</a></p>`,
        });
        if (ok) {
          emailOk = true;
        }
      }

      if (inAppOk || emailOk) {
        await this.prisma.subscriptionAlert.create({
          data: {
            organizationId: sub.organizationId,
            kind: ALERT_KIND,
            periodEnd: sub.currentPeriodEnd,
          },
        });
        sent += 1;
      }
    }

    if (sent > 0) {
      this.logger.log(`Sent ${sent} expiry warning(s)`);
    }
    return sent;
  }

  private async findOrgAdmins(
    organizationId: string,
  ): Promise<ReadonlyArray<{ id: string; email: string; name: string }>> {
    const admins = await this.prisma.user.findMany({
      where: {
        organizationId,
        role: { name: { in: ['ORG_ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN'] } },
      },
      select: { id: true, email: true, name: true },
    });
    if (admins.length > 0) {
      return admins;
    }
    const fallback = await this.prisma.user.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true },
    });
    return fallback ? [fallback] : [];
  }
}
