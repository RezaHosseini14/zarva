import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { IIntegrationRow, IIntegrationsSummary } from '@zarva/shared';
import { createHash, randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { CreateIntegrationDto } from './dto/integrations.dto';

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
        ...(kind
          ? { kind: kind as 'device' | 'scale' | 'api' | 'webhook' }
          : {}),
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

    // Mock adapter: scales/devices flip healthy; api/webhook prefer healthy if config present
    const status =
      existing.kind === 'scale' || existing.kind === 'device'
        ? Math.random() > 0.2
          ? 'healthy'
          : 'degraded'
        : existing.config
          ? 'healthy'
          : 'offline';

    const r = await this.prisma.integration.update({
      where: { id },
      data: {
        status,
        lastCheckedAt: new Date(),
        detail: status === 'healthy' ? 'ok' : status,
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

  private map(r: {
    id: string;
    kind: 'device' | 'scale' | 'api' | 'webhook';
    code: string;
    status: 'healthy' | 'degraded' | 'offline' | 'unknown';
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
