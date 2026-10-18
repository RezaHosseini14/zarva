import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { IIntegrationRow, IIntegrationsSummary } from '@zarva/shared';
import { createHash, randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { CreateIntegrationDto } from './dto/integrations.dto';

type IntegrationKind = 'device' | 'scale' | 'api' | 'webhook';
type IntegrationStatus = 'healthy' | 'degraded' | 'offline' | 'unknown';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: IAuthUser): Promise<IIntegrationsSummary> {
    this.assertRead(user);
    const rows = await this.prisma.integration.findMany({
      where: { organizationId: user.organizationId },
      select: { kind: true, status: true },
    });
    const apiKeys = await this.prisma.orgApiKey.count({
      where: { organizationId: user.organizationId, revokedAt: null },
    });
    const byKindMap = new Map<string, number>();
    let healthy = 0;
    let degraded = 0;
    let offline = 0;
    for (const r of rows) {
      byKindMap.set(r.kind, (byKindMap.get(r.kind) ?? 0) + 1);
      if (r.status === 'healthy') healthy += 1;
      else if (r.status === 'degraded') degraded += 1;
      else if (r.status === 'offline') offline += 1;
    }
    const byKind = [...byKindMap.entries()].map(([kind, count]) => ({ kind, count }));
    return {
      total: rows.length,
      healthy,
      degraded,
      offline,
      apiKeys,
      byKind,
    };
  }

  async list(user: IAuthUser, kind?: string): Promise<IIntegrationRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.integration.findMany({
      where: {
        organizationId: user.organizationId,
        ...(kind ? { kind: kind as IntegrationKind } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.map(r));
  }

  async create(user: IAuthUser, dto: CreateIntegrationDto): Promise<IIntegrationRow> {
    this.assertWrite(user);
    const r = await this.prisma.integration.create({
      data: {
        organizationId: user.organizationId,
        kind: dto.kind,
        code: dto.code,
        detail: dto.detail ?? '',
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        status: 'unknown',
      },
    });
    return this.map(r);
  }

  async test(user: IAuthUser, id: string): Promise<IIntegrationRow> {
    this.assertWrite(user);
    const existing = await this.prisma.integration.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!existing) throw new NotFoundException('Integration not found');

    const config = this.asConfigRecord(existing.config);
    const check = await this.runDeterministicTest(existing.kind, config);

    const r = await this.prisma.integration.update({
      where: { id },
      data: {
        status: check.status,
        lastCheckedAt: new Date(),
        detail: check.detail,
      },
    });
    return this.map(r);
  }

  async createApiKey(
    user: IAuthUser,
    name: string,
  ): Promise<{ readonly id: string; readonly key: string; readonly prefix: string }> {
    this.assertWrite(user);
    const raw = `zv_${randomBytes(24).toString('hex')}`;
    const prefix = raw.slice(0, 10);
    const keyHash = createHash('sha256').update(raw).digest('hex');
    const row = await this.prisma.orgApiKey.create({
      data: {
        organizationId: user.organizationId,
        name,
        keyHash,
        keyPrefix: prefix,
      },
    });
    return { id: row.id, key: raw, prefix };
  }

  private asConfigRecord(config: unknown): Record<string, unknown> {
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return {};
    }
    return config as Record<string, unknown>;
  }

  private hasUsableConfig(config: Record<string, unknown>): boolean {
    return Object.keys(config).some((key) => {
      const value = config[key];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return Number.isFinite(value);
      if (typeof value === 'boolean') return true;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value as object).length > 0;
      return false;
    });
  }

  private webhookUrl(config: Record<string, unknown>): string | null {
    const raw = config.url ?? config.webhookUrl ?? config.endpoint;
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return null;
    }
    return trimmed;
  }

  private async probeWebhook(url: string): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    try {
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      return res.ok || (res.status >= 300 && res.status < 500);
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  private async runDeterministicTest(
    kind: IntegrationKind,
    config: Record<string, unknown>,
  ): Promise<{ status: IntegrationStatus; detail: string }> {
    if (kind === 'scale' || kind === 'device') {
      if (!this.hasUsableConfig(config)) {
        return { status: 'offline', detail: 'not_configured' };
      }
      return { status: 'healthy', detail: 'configured' };
    }

    if (kind === 'api') {
      if (!this.hasUsableConfig(config)) {
        return { status: 'offline', detail: 'not_configured' };
      }
      return { status: 'healthy', detail: 'configured' };
    }

    if (kind === 'webhook') {
      if (!this.hasUsableConfig(config)) {
        return { status: 'offline', detail: 'not_configured' };
      }
      const url = this.webhookUrl(config);
      if (!url) {
        return { status: 'degraded', detail: 'invalid_webhook_url' };
      }
      const reachable = await this.probeWebhook(url);
      return reachable
        ? { status: 'healthy', detail: 'webhook_reachable' }
        : { status: 'degraded', detail: 'webhook_unreachable' };
    }

    return { status: 'offline', detail: 'unknown_kind' };
  }

  private map(r: {
    id: string;
    kind: IntegrationKind;
    code: string;
    status: IntegrationStatus;
    detail: string;
  }): IIntegrationRow {
    return {
      id: r.id,
      a: r.code,
      b: r.status,
      c: r.detail || r.kind,
      kind: r.kind,
      status: r.status,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('integrations.read')) {
      throw new ForbiddenException('Missing integrations.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('integrations.manage')) {
      throw new ForbiddenException('Missing integrations.manage');
    }
  }

  private isAdmin(user: IAuthUser): boolean {
    return (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    );
  }
}
