import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { Public } from '../../common/public.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import { AuthService } from './auth.service';
import {
  AcceptInviteDto,
  CreateInviteDto,
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  RenameSessionDto,
  ResetPasswordDto,
  SignupDto,
  TotpDisableDto,
  TotpEnableDto,
} from './dto/auth.dto';
import type { IAuthUser } from './auth.types';
import { clientIpFromRequest } from './device-meta.util';
import { SessionsService } from './sessions.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessions: SessionsService,
  ) {}

  private deviceFromReq(req: Request, dto?: { clientDeviceId?: string; revokeSessionId?: string }) {
    return {
      clientDeviceId: dto?.clientDeviceId,
      revokeSessionId: dto?.revokeSessionId,
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
      ip: clientIpFromRequest(req),
    };
  }

  @Public()
  @Post('signup')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register org + admin (starts trial; requires phone OTP)' })
  async signup(
    @Body() dto: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto, res, this.deviceFromReq(req));
    return this.authService.attachAccessToken(result, res);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login with email + password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, res, this.deviceFromReq(req, dto));
    return this.authService.attachAccessToken(result, res);
  }

  @Public()
  @Post('otp/request')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request SMS OTP for login or signup' })
  requestOtp(@Body() dto: OtpRequestDto) {
    return this.authService.requestOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Verify SMS OTP and login' })
  async verifyOtp(
    @Body() dto: OtpVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtpLogin(
      dto,
      res,
      this.deviceFromReq(req, dto),
    );
    return this.authService.attachAccessToken(result, res);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    const result = await this.authService.refresh(token, res, this.deviceFromReq(req));
    return this.authService.attachAccessToken(result, res);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke current session only' })
  async logout(
    @CurrentUser() user: IAuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    return this.authService.logout(user.id, res, token);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user profile' })
  async me(@CurrentUser() user: IAuthUser) {
    return { user: await this.authService.me(user.id) };
  }

  @Get('sessions/pulse')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cheap session liveness probe (JWT family check only)',
  })
  pulse(): { ok: true } {
    // JwtStrategy already asserted family liveness (cached).
    return { ok: true };
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions for current user' })
  async listSessions(@CurrentUser() user: IAuthUser, @Req() req: Request) {
    const token = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    const familyId = await this.sessions.resolveCurrentFamilyId(user.id, token);
    return { items: await this.sessions.listActiveForUser(user.id, familyId) };
  }

  @Get('sessions/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Login history for current user' })
  async sessionHistory(
    @CurrentUser() user: IAuthUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.sessions.listHistoryForUser(
      user.id,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 30,
    );
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a session' })
  revokeSession(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessions.revokeSessionForUser(user.id, id);
  }

  @Post('sessions/:id/deny')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deny a new login (not me)' })
  denySession(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessions.denySession(user.id, id);
  }

  @Post('sessions/revoke-others')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all other sessions' })
  async revokeOthers(@CurrentUser() user: IAuthUser, @Req() req: Request) {
    const token = (req.cookies as Record<string, string> | undefined)?.refresh_token;
    const familyId = await this.sessions.resolveCurrentFamilyId(user.id, token);
    if (!familyId) {
      return { ok: true, count: 0 };
    }
    return this.sessions.revokeOthers(user.id, familyId);
  }

  @Patch('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rename a session label' })
  renameSession(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenameSessionDto,
  ) {
    return this.sessions.renameSession(user.id, id, dto.label ?? null);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('totp/setup')
  @ApiBearerAuth()
  setupTotp(@CurrentUser() user: IAuthUser) {
    return this.authService.setupTotp(user.id);
  }

  @Post('totp/enable')
  @ApiBearerAuth()
  enableTotp(@CurrentUser() user: IAuthUser, @Body() dto: TotpEnableDto) {
    return this.authService.enableTotp(user.id, dto);
  }

  @Post('totp/disable')
  @ApiBearerAuth()
  disableTotp(@CurrentUser() user: IAuthUser, @Body() dto: TotpDisableDto) {
    return this.authService.disableTotp(user.id, dto);
  }

  @Post('invites')
  @ApiBearerAuth()
  createInvite(@CurrentUser() user: IAuthUser, @Body() dto: CreateInviteDto) {
    return this.authService.createInvite(user, dto);
  }

  @Public()
  @Post('invites/accept')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async acceptInvite(
    @Body() dto: AcceptInviteDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.acceptInvite(dto, res, this.deviceFromReq(req));
    return this.authService.attachAccessToken(result, res);
  }
}
