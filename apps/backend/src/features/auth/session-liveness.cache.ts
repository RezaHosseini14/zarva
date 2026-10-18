import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

interface ILivenessEntry {
  readonly ok: boolean;
  readonly at: number;
}

/** In-process cache so JWT validation does not hit Postgres on every request. */
@Injectable()
export class SessionLivenessCache {
  private readonly cache = new Map<string, ILivenessEntry>();
  private readonly liveTtlMs = 30_000;

  constructor(private readonly prisma: PrismaService) {}

  markRevoked(familyId: string): void {
    this.cache.set(familyId, { ok: false, at: Date.now() });
  }

  markLive(familyId: string): void {
    this.cache.set(familyId, { ok: true, at: Date.now() });
  }

  async assertLive(familyId: string, userId: string): Promise<void> {
    const now = Date.now();
    const cached = this.cache.get(familyId);
    // Live hits only — never trust a dead entry without re-checking Postgres
    // (same-device re-login reuses familyId after markRevoked).
    if (cached?.ok && now - cached.at < this.liveTtlMs) {
      return;
    }

    const live = await this.prisma.refreshSession.findFirst({
      where: {
        familyId,
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!live) {
      this.cache.set(familyId, { ok: false, at: now });
      throw new UnauthorizedException('Session revoked');
    }

    this.cache.set(familyId, { ok: true, at: now });
  }
}
