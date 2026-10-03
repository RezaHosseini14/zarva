import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  IAssignSubscriptionRequest,
  IEntitlementOverrideRequest,
  IPlanEntitlements,
  IPlatformOrganizationDetail,
  IPlatformOrganizationSummary,
  PlanCode,
  SubscriptionSource,
  SubscriptionStatus,
} from '@zarva/shared';
import { isPlatformAdminRole, isThemePresetId } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class PlatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  assertPlatformAdmin(user: IAuthUser): void {
    if (!isPlatformAdminRole(user.roleName)) {
      throw new ForbiddenException('Platform admin only');
    }
  }

  async listOrganizations(user: IAuthUser): Promise<ReadonlyArray<IPlatformOrganizationSummary>> {
    this.assertPlatformAdmin(user);
    const orgs = await this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        subscription: { include: { plan: true } },
      },
    });
    return orgs.map((org) => this.toSummary(org));
  }

  async getOrganization(user: IAuthUser, id: string): Promise<IPlatformOrganizationDetail> {
    this.assertPlatformAdmin(user);
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: { include: { prices: true } } } },
      },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const override = await this.prisma.entitlementOverride.findFirst({
      where: { organizationId: id },
      orderBy: { createdAt: 'desc' },
    });

    const summary = this.toSummary(org);
    const entitlements = org.subscription
      ? (org.subscription.plan.entitlements as unknown as IPlanEntitlements)
      : null;

    return {
      ...summary,
      themeTokens: org.themeTokens,
      entitlements,
      entitlementOverride: override
        ? (override.entitlements as unknown as IPlanEntitlements)
        : null,
      subscription: org.subscription
        ? {
            id: org.subscription.id,
            organizationId: org.subscription.organizationId,
            planId: org.subscription.planId,
            status: org.subscription.status as SubscriptionStatus,
            source: (org.subscription.source as SubscriptionSource) ?? 'manual',
            currentPeriodStart: org.subscription.currentPeriodStart?.toISOString() ?? null,
            currentPeriodEnd: org.subscription.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: org.subscription.cancelAtPeriodEnd,
            stripeSubscriptionId: org.subscription.stripeSubscriptionId,
            plan: {
              id: org.subscription.plan.id,
              code: org.subscription.plan.code as PlanCode,
              name: org.subscription.plan.name,
              entitlements: org.subscription.plan.entitlements as unknown as IPlanEntitlements,
              isActive: org.subscription.plan.isActive,
              prices: org.subscription.plan.prices.map((p) => ({
                id: p.id,
                planId: p.planId,
                interval: p.interval as 'month' | 'year',
                amountCents: p.amountCents,
                currency: p.currency,
                stripePriceId: p.stripePriceId,
              })),
            },
          }
        : null,
    };
  }

  async assignSubscription(user: IAuthUser, orgId: string, dto: IAssignSubscriptionRequest) {
    this.assertPlatformAdmin(user);
    await this.ensureOrg(orgId);
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : undefined;
    const sub = await this.billing.assignSubscription(orgId, {
      planId: dto.planId,
      interval: dto.interval,
      status: dto.status,
      periodEnd,
      months: dto.months,
      years: dto.years,
    });
    await this.audit(user, orgId, 'platform.subscription.assign', {
      planId: dto.planId,
      status: sub.status,
      periodEnd: sub.currentPeriodEnd,
    });
    return sub;
  }

  async setEntitlements(user: IAuthUser, orgId: string, dto: IEntitlementOverrideRequest) {
    this.assertPlatformAdmin(user);
    await this.ensureOrg(orgId);
    const row = await this.billing.setEntitlementOverride(orgId, dto.entitlements, dto.reason);
    await this.audit(user, orgId, 'platform.entitlements.override', { reason: dto.reason });
    return row;
  }

  async setTheme(
    user: IAuthUser,
    orgId: string,
    themePreset: string,
    themeTokens?: Record<string, string> | null,
  ) {
    this.assertPlatformAdmin(user);
    if (!isThemePresetId(themePreset)) {
      throw new ForbiddenException('Invalid theme preset');
    }
    await this.ensureOrg(orgId);
    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        themePreset,
        ...(themeTokens === null
          ? { themeTokens: Prisma.JsonNull }
          : themeTokens
            ? { themeTokens: themeTokens as Prisma.InputJsonValue }
            : {}),
      },
    });
    await this.audit(user, orgId, 'platform.theme.assign', { themePreset });
    return { preset: org.themePreset, tokens: org.themeTokens };
  }

  private async ensureOrg(id: string): Promise<void> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
  }

  private async audit(
    user: IAuthUser,
    organizationId: string,
    action: string,
    meta: object,
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action,
        meta,
      },
    });
  }

  private toSummary(org: {
    id: string;
    name: string;
    slug: string;
    themePreset: string;
    createdAt: Date;
    subscription: {
      status: string;
      source: string;
      currentPeriodEnd: Date | null;
      plan: { code: string; name: string };
    } | null;
  }): IPlatformOrganizationSummary {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      themePreset: org.themePreset,
      createdAt: org.createdAt.toISOString(),
      subscription: org.subscription
        ? {
            status: org.subscription.status as SubscriptionStatus,
            source: (org.subscription.source as SubscriptionSource) ?? 'manual',
            currentPeriodEnd: org.subscription.currentPeriodEnd?.toISOString() ?? null,
            planCode: org.subscription.plan.code,
            planName: org.subscription.plan.name,
          }
        : null,
    };
  }
}
