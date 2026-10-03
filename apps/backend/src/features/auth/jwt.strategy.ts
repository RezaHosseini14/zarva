import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser, IJwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtPayload): Promise<IAuthUser> {
    if (payload.familyId) {
      const live = await this.prisma.refreshSession.findFirst({
        where: {
          familyId: payload.familyId,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      if (!live) {
        throw new UnauthorizedException('Session revoked');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) {
      return {
        id: payload.sub,
        email: payload.email,
        phone: '',
        address: '',
        name: payload.name,
        roleName: payload.roleName,
        permissions: payload.permissions,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
        locale: payload.locale,
      };
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.key);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      address: user.address,
      name: user.name,
      roleName: user.role.name,
      permissions,
      organizationId: user.organizationId,
      branchId: user.branchId,
      locale: user.locale,
    };
  }
}
