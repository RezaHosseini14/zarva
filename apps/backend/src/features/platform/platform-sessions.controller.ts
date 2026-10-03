import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { DeviceBanScope } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { SessionsService } from '../auth/sessions.service';
import { PlatformService } from './platform.service';

class SecurityPolicyDto {
  @ApiPropertyOptional({ nullable: true, description: 'null or 0 = unlimited' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDevicesPerUser?: number | null;
}

class CreateDeviceBanDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  clientDeviceId!: string;

  @ApiProperty({ enum: ['user', 'global'] })
  @IsIn(['user', 'global'])
  scope!: DeviceBanScope;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateDeviceBanDto) => o.scope === 'user')
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Platform')
@ApiBearerAuth()
@Controller('platform')
export class PlatformSessionsController {
  constructor(
    private readonly platform: PlatformService,
    private readonly sessions: SessionsService,
  ) {}

  @Get('organizations/:id/security-policy')
  @ApiOperation({ summary: 'Get org device security policy' })
  async getSecurityPolicy(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.getSecurityPolicy(id);
  }

  @Put('organizations/:id/security-policy')
  @ApiOperation({ summary: 'Set org max devices per user' })
  async setSecurityPolicy(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SecurityPolicyDto,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.setSecurityPolicy(id, dto.maxDevicesPerUser ?? null);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions across orgs' })
  listSessions(
    @CurrentUser() user: IAuthUser,
    @Query('organizationId') organizationId?: string,
    @Query('userId') userId?: string,
    @Query('q') q?: string,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.platformListSessions({ organizationId, userId, q });
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke any session (admin)' })
  revokeSession(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.platformRevokeSession(id);
  }

  @Get('login-history')
  @ApiOperation({ summary: 'Login history across orgs' })
  loginHistory(
    @CurrentUser() user: IAuthUser,
    @Query('organizationId') organizationId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.platformListHistory({
      organizationId,
      userId,
      from,
      to,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 30,
    });
  }

  @Get('device-bans')
  @ApiOperation({ summary: 'List active device bans' })
  listBans(@CurrentUser() user: IAuthUser) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.listBans();
  }

  @Post('device-bans')
  @ApiOperation({ summary: 'Ban a device (user or global scope)' })
  createBan(@CurrentUser() user: IAuthUser, @Body() dto: CreateDeviceBanDto) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.createBan({
      clientDeviceId: dto.clientDeviceId,
      scope: dto.scope,
      userId: dto.userId,
      reason: dto.reason,
      bannedById: user.id,
    });
  }

  @Delete('device-bans/:id')
  @ApiOperation({ summary: 'Lift a device ban' })
  liftBan(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.platform.assertPlatformAdmin(user);
    return this.sessions.liftBan(id, user.id);
  }
}
