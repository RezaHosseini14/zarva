import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { generateSecret, generateURI, verifySync } from 'otplib';

import { PrismaService } from '../../prisma/prisma.service';
import type {
  AcceptInviteDto,
  CreateInviteDto,
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  ResetPasswordDto,
  SignupDto,
  TotpDisableDto,
  TotpEnableDto,
} from './dto/auth.dto';
import type { IAuthUser, IJwtPayload } from './auth.types';
import type { DeviceType, IPlanEntitlements } from '@zarva/shared';
import type { IIssueDeviceContext } from './sessions.service';
import { SessionsService } from './sessions.service';
import { OtpService } from './otp.service';
import { normalizeIranPhone } from '../sms/phone.util';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly otp: OtpService,
    private readonly email: EmailService,
    private readonly sessions: SessionsService,
  ) {}

  async requestOtp(dto: OtpRequestDto): Promise<{ ok: true; expiresIn: number }> {
    const phone = normalizeIranPhoneSafe(dto.phone);
    if (dto.purpose === 'login') {
      const user = await this.prisma.user.findUnique({ where: { phone } });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      const existing = await this.prisma.user.findUnique({ where: { phone } });
      if (existing) {
        throw new ConflictException('Phone already registered');
      }
    }
    return this.otp.request(phone, dto.purpose);
  }

  async verifyOtpLogin(
    dto: OtpVerifyDto,
    res: Response,
    device?: IIssueDeviceContext,
  ): Promise<{ user: IAuthUser }> {
    const phone = await this.otp.consume(dto.phone, 'login', dto.code);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const authUser = await this.toAuthUser(user.id);
    await this.issueTokens(authUser, res, undefined, device);
    await this.prisma.auditLog.create({
      data: {
        organizationId: authUser.organizationId,
        userId: authUser.id,
        action: 'auth.login.otp',
        meta: {
          clientDeviceId: device?.clientDeviceId ?? null,
          ip: device?.ip ?? null,
        },
      },
    });
    return { user: authUser };
  }

  async signup(
    dto: SignupDto,
    res: Response,
    device?: IIssueDeviceContext,
  ): Promise<{ user: IAuthUser }> {
    await this.otp.consume(dto.phone, 'signup', dto.otpCode);

    let phone: string;
    try {
      phone = normalizeIranPhone(dto.phone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }

    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new ConflictException('Phone already registered');
    }

    const slugBase = dto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const slug = `${slugBase || 'org'}-${randomUUID().slice(0, 8)}`;

    const role = await this.prisma.role.findUnique({ where: { name: 'ORG_ADMIN' } });
    if (!role) {
      throw new ConflictException('Roles not seeded');
    }

    const trialPlan = await this.prisma.plan.findUnique({ where: { code: 'trial' } });
    if (!trialPlan) {
      throw new ConflictException('Plans not seeded');
    }

    const passwordHash = await argon2.hash(dto.password);
    const trialDays = Number(this.config.get('TRIAL_DAYS') ?? 14);
    const entitlements = trialPlan.entitlements as unknown as IPlanEntitlements;

    const org = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        slug,
        users: {
          create: {
            email: dto.email,
            phone,
            address: dto.address.trim(),
            name: dto.name,
            passwordHash,
            locale: dto.locale ?? 'fa',
            roleId: role.id,
          },
        },
        subscription: {
          create: {
            planId: trialPlan.id,
            status: 'trialing',
            source: 'manual',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + trialDays * 86_400_000),
          },
        },
      },
      include: { users: true },
    });

    const user = org.users[0];
    if (!user) {
      throw new ConflictException('User creation failed');
    }

    void entitlements;
    const authUser = await this.toAuthUser(user.id);
    await this.issueTokens(authUser, res, undefined, device);
    return { user: authUser };
  }

  async login(
    dto: LoginDto,
    res: Response,
    device?: IIssueDeviceContext,
  ): Promise<{ user: IAuthUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.totpEnabled) {
      if (!dto.totpCode) {
        throw new UnauthorizedException('TOTP code required');
      }
      if (!user.totpSecret || !this.verifyTotp(user.totpSecret, dto.totpCode)) {
        throw new UnauthorizedException('Invalid TOTP code');
      }
    }
    const authUser = await this.toAuthUser(user.id);
    await this.issueTokens(authUser, res, undefined, {
      ...device,
      clientDeviceId: dto.clientDeviceId ?? device?.clientDeviceId,
      revokeSessionId: dto.revokeSessionId ?? device?.revokeSessionId,
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: authUser.organizationId,
        userId: authUser.id,
        action: 'auth.login',
        meta: {
          clientDeviceId: dto.clientDeviceId ?? device?.clientDeviceId ?? null,
          ip: device?.ip ?? null,
        },
      },
    });
    return { user: authUser };
  }

  async me(userId: string): Promise<IAuthUser> {
    return this.toAuthUser(userId);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return { ok: true };
    }
    const raw = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    const appUrl = this.config.get<string>('APP_PUBLIC_URL') ?? 'http://localhost:3100';
    await this.email.send({
      to: user.email,
      subject: 'Reset your ZARVA password',
      text: `Use this link to reset your password: ${appUrl}/reset?token=${raw}`,
    });
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: true }> {
    const tokenHash = this.hashToken(dto.token);
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const passwordHash = await argon2.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  async setupTotp(userId: string): Promise<{ secret: string; uri: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const secret = generateSecret();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnabled: false },
    });
    const uri = generateURI({
      issuer: 'ZARVA',
      label: user.email,
      secret,
    });
    return { secret, uri };
  }

  async enableTotp(userId: string, dto: TotpEnableDto): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.totpSecret) {
      throw new BadRequestException('Run TOTP setup first');
    }
    if (!this.verifyTotp(user.totpSecret, dto.code)) {
      throw new BadRequestException('Invalid TOTP code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });
    return { ok: true };
  }

  async disableTotp(userId: string, dto: TotpDisableDto): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.totpEnabled || !user.totpSecret) {
      throw new BadRequestException('TOTP is not enabled');
    }
    if (!this.verifyTotp(user.totpSecret, dto.code)) {
      throw new BadRequestException('Invalid TOTP code');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: false, totpSecret: null },
    });
    return { ok: true };
  }

  async createInvite(user: IAuthUser, dto: CreateInviteDto): Promise<{ ok: true }> {
    if (
      user.roleName !== 'ORG_ADMIN' &&
      user.roleName !== 'SUPER_ADMIN' &&
      user.roleName !== 'PLATFORM_ADMIN' &&
      !user.permissions.includes('users.manage')
    ) {
      throw new ForbiddenException('Missing users.manage');
    }
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const raw = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + 7 * 86_400_000);
    await this.prisma.userInvite.create({
      data: {
        email: dto.email,
        organizationId: user.organizationId,
        roleId: dto.roleId,
        tokenHash,
        invitedById: user.id,
        expiresAt,
      },
    });
    const appUrl = this.config.get<string>('APP_PUBLIC_URL') ?? 'http://localhost:3100';
    await this.email.send({
      to: dto.email,
      subject: 'You are invited to ZARVA',
      text: `Accept invite: ${appUrl}/invite?token=${raw}`,
    });
    return { ok: true };
  }

  async acceptInvite(
    dto: AcceptInviteDto,
    res: Response,
    device?: IIssueDeviceContext,
  ): Promise<{ user: IAuthUser }> {
    const tokenHash = this.hashToken(dto.token);
    const invite = await this.prisma.userInvite.findUnique({
      where: { tokenHash },
    });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invite');
    }
    const existingEmail = await this.prisma.user.findUnique({ where: { email: invite.email } });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }
    let phone: string;
    try {
      phone = normalizeIranPhone(dto.phone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }
    const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new ConflictException('Phone already registered');
    }
    const passwordHash = await argon2.hash(dto.password);
    const created = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: invite.email,
          phone,
          address: dto.address.trim(),
          name: dto.name,
          passwordHash,
          organizationId: invite.organizationId,
          roleId: invite.roleId,
        },
      });
      await tx.userInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return u;
    });
    const authUser = await this.toAuthUser(created.id);
    await this.issueTokens(authUser, res, undefined, device);
    return { user: authUser };
  }

  private verifyTotp(secret: string, token: string): boolean {
    const result = verifySync({ secret, token });
    return result.valid;
  }

  async logout(
    userId: string,
    res: Response,
    refreshToken?: string,
  ): Promise<{ ok: true }> {
    await this.sessions.logoutCurrent(userId, refreshToken);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { ok: true };
  }

  async refresh(
    refreshToken: string | undefined,
    res: Response,
    device?: IIssueDeviceContext,
  ): Promise<{ user: IAuthUser }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.refreshSession.updateMany({
          where: { familyId: session.familyId },
          data: { revokedAt: new Date() },
        });
        this.sessions.markFamilyRevoked(session.familyId);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    const authUser = await this.toAuthUser(session.userId);
    await this.issueTokens(authUser, res, session.familyId, {
      clientDeviceId: session.clientDeviceId ?? device?.clientDeviceId,
      userAgent: device?.userAgent ?? session.userAgent,
      ip: device?.ip ?? session.ip,
    }, true);
    return { user: authUser };
  }

  private async toAuthUser(userId: string): Promise<IAuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      address: user.address,
      name: user.name,
      roleName: user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.key),
      organizationId: user.organizationId,
      branchId: user.branchId,
      locale: user.locale,
    };
  }

  private async issueTokens(
    user: IAuthUser,
    res: Response,
    familyId?: string,
    device?: IIssueDeviceContext,
    isRefresh = false,
  ): Promise<void> {
    const refreshRaw = randomUUID() + randomUUID();
    const refreshTtl = this.config.get('JWT_REFRESH_TTL') ?? '7d';
    const expiresAt = new Date(Date.now() + this.parseTtlMs(refreshTtl));

    let resolvedFamilyId = familyId;
    let isNewDevice = false;
    let meta: {
      clientDeviceId: string | null;
      deviceName: string;
      deviceType: DeviceType;
      os: string | null;
      browser: string | null;
      ip: string | null;
      userAgent: string | null;
    } = {
      clientDeviceId: device?.clientDeviceId?.trim() || null,
      deviceName: 'Unknown device',
      deviceType: 'unknown',
      os: null,
      browser: null,
      ip: device?.ip ?? null,
      userAgent: device?.userAgent ?? null,
    };

    if (isRefresh && familyId) {
      await this.sessions.touchFamily(familyId);
      const existing = await this.prisma.refreshSession.findFirst({
        where: { familyId },
        orderBy: { createdAt: 'desc' },
      });
      meta = {
        clientDeviceId: existing?.clientDeviceId ?? meta.clientDeviceId,
        deviceName: existing?.deviceName ?? meta.deviceName,
        deviceType: (existing?.deviceType as DeviceType | null) ?? meta.deviceType,
        os: existing?.os ?? null,
        browser: existing?.browser ?? null,
        ip: device?.ip ?? existing?.ip ?? null,
        userAgent: device?.userAgent ?? existing?.userAgent ?? null,
      };
    } else {
      const prepared = await this.sessions.prepareNewSession(
        user.id,
        user.organizationId,
        device ?? {},
      );
      resolvedFamilyId = prepared.familyId;
      isNewDevice = prepared.isNewDevice;
      meta = {
        clientDeviceId: prepared.meta.clientDeviceId,
        deviceName: prepared.meta.deviceName,
        deviceType: prepared.meta.deviceType,
        os: prepared.meta.os,
        browser: prepared.meta.browser,
        ip: prepared.meta.ip,
        userAgent: prepared.meta.userAgent,
      };
    }

    const created = await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshRaw),
        familyId: resolvedFamilyId ?? randomUUID(),
        clientDeviceId: meta.clientDeviceId,
        deviceName: meta.deviceName,
        deviceType: meta.deviceType,
        os: meta.os,
        browser: meta.browser,
        userAgent: meta.userAgent,
        ip: meta.ip,
        lastSeenAt: new Date(),
        expiresAt,
      },
    });
    this.sessions.markFamilyLive(created.familyId);

    if (!isRefresh) {
      await this.sessions.afterSessionCreated({
        userId: user.id,
        organizationId: user.organizationId,
        sessionId: created.id,
        familyId: created.familyId,
        isNewDevice,
        meta,
      });
    }

    // Sign AFTER session exists so JWT carries familyId for realtime kicks.
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roleName: user.roleName,
      permissions: [...user.permissions],
      branchId: user.branchId,
      locale: user.locale,
      name: user.name,
      familyId: created.familyId,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '24h',
    });

    res.cookie('refresh_token', refreshRaw, {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE') === 'true',
      sameSite: 'lax',
      path: '/api/v1/auth',
      expires: expiresAt,
    });
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    (res.locals as { accessToken?: string }).accessToken = accessToken;
  }

  /** Expose access token in JSON for SPA convenience */
  attachAccessToken<T extends object>(
    body: T,
    res: Response,
  ): T & { accessToken: string } {
    const accessToken = (res.locals as { accessToken?: string }).accessToken ?? '';
    return { ...body, accessToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtlMs(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
      return 7 * 86_400_000;
    }
    const n = Number(match[1]);
    const unit = match[2];
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return n * mult;
  }
}

function normalizeIranPhoneSafe(raw: string): string {
  try {
    return normalizeIranPhone(raw);
  } catch {
    throw new BadRequestException('Invalid phone number');
  }
}
