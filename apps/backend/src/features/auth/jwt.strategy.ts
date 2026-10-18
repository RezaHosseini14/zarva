import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { IAuthUser, IJwtPayload } from './auth.types';
import { SessionLivenessCache } from './session-liveness.cache';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly liveness: SessionLivenessCache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtPayload): Promise<IAuthUser> {
    // Hot path: trust claims already signed into the access token.
    // Only verify session family liveness (cached) so revoke still works.
    if (payload.familyId) {
      await this.liveness.assertLive(payload.familyId, payload.sub);
    }

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
}
