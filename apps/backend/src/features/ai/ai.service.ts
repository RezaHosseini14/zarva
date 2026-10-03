import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAiCapabilities, IAiInsightRow, IAiSummarizeResult } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { DomainNotificationPublisher } from '../notifications/domain-notification.publisher';
import { refreshLowStockInsights } from './ai.rules';
import type { AiSummarizeDto, RefreshAiRulesDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly domainNotifications: DomainNotificationPublisher,
  ) {}

  async listInsights(user: IAuthUser): Promise<IAiInsightRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.aiInsight.findMany({
      where: { organizationId: user.organizationId, dismissedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.title,
      b: r.body,
      c: r.severity,
      code: r.code,
      severity: r.severity,
      source: r.source,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async refreshRules(user: IAuthUser, dto: RefreshAiRulesDto): Promise<{ created: number }> {
    this.assertWrite(user);
    const created = await refreshLowStockInsights(this.prisma, user.organizationId, {
      thresholdQty: dto.thresholdQty,
    });
    if (created > 0) {
      const critical = await this.prisma.aiInsight.count({
        where: {
          organizationId: user.organizationId,
          dismissedAt: null,
          severity: 'critical',
          createdAt: { gte: new Date(Date.now() - 60_000) },
        },
      });
      if (critical > 0) {
        await this.domainNotifications.notifyOrgUsers({
          organizationId: user.organizationId,
          title: 'Critical inventory insight',
          body: `${critical} critical AI insight(s) were generated.`,
          priority: 'HIGH',
        });
      }
    }
    return { created };
  }

  async dismiss(user: IAuthUser, id: string): Promise<{ ok: true }> {
    this.assertWrite(user);
    const row = await this.prisma.aiInsight.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!row) {
      throw new NotFoundException('Insight not found');
    }
    await this.prisma.aiInsight.update({
      where: { id },
      data: { dismissedAt: new Date() },
    });
    return { ok: true };
  }

  capabilities(): IAiCapabilities {
    const hasLlm = Boolean(this.config.get<string>('AI_LLM_API_KEY'));
    return {
      rules: true,
      summarize: hasLlm,
    };
  }

  async summarize(user: IAuthUser, dto: AiSummarizeDto): Promise<IAiSummarizeResult> {
    this.assertRead(user);
    const apiKey = this.config.get<string>('AI_LLM_API_KEY');
    if (!apiKey) {
      throw new HttpException('AI summarize is not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const baseUrl = (
      this.config.get<string>('AI_LLM_BASE_URL') ?? 'https://api.openai.com/v1'
    ).replace(/\/$/, '');
    const model = this.config.get<string>('AI_LLM_MODEL') ?? 'gpt-4o-mini';
    const trimmed = dto.text.trim().slice(0, 4000);
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Summarize gold-business operational notes in the same language as the user. Be concise.',
          },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });
    if (!res.ok) {
      throw new HttpException('AI summarize provider failed', HttpStatus.BAD_GATEWAY);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new HttpException('AI summarize returned empty', HttpStatus.BAD_GATEWAY);
    }
    return { text, model };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('ai.read')) {
      throw new ForbiddenException('Missing ai.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('ai.manage')) {
      throw new ForbiddenException('Missing ai.manage');
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
