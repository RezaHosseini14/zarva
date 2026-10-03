import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import type { IPlanEntitlements, SubscriptionStatus } from '@zarva/shared';
import { THEME_PRESETS } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { PlatformService } from './platform.service';

class AssignSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  planId!: string;

  @ApiProperty({ required: false, enum: ['month', 'year'] })
  @IsOptional()
  @IsIn(['month', 'year'])
  interval?: 'month' | 'year';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: SubscriptionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  periodEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  months?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  years?: number;
}

class EntitlementOverrideDto {
  @ApiProperty()
  @IsObject()
  entitlements!: IPlanEntitlements;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

class AssignThemeDto {
  @ApiProperty({ enum: THEME_PRESETS })
  @IsIn([...THEME_PRESETS])
  themePreset!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  themeTokens?: Record<string, string> | null;
}

@ApiTags('Platform')
@ApiBearerAuth()
@Controller('platform/organizations')
export class PlatformController {
  constructor(private readonly platform: PlatformService) {}

  @Get()
  @ApiOperation({ summary: 'List all organizations (platform admin)' })
  list(@CurrentUser() user: IAuthUser) {
    return this.platform.listOrganizations(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Organization detail (platform admin)' })
  get(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.platform.getOrganization(user, id);
  }

  @Put(':id/subscription')
  @ApiOperation({ summary: 'Assign or change subscription manually' })
  assignSubscription(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignSubscriptionDto,
  ) {
    return this.platform.assignSubscription(user, id, dto);
  }

  @Put(':id/entitlements')
  @ApiOperation({ summary: 'Set entitlement override' })
  setEntitlements(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EntitlementOverrideDto,
  ) {
    return this.platform.setEntitlements(user, id, dto);
  }

  @Put(':id/theme')
  @ApiOperation({ summary: 'Assign theme preset' })
  setTheme(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignThemeDto,
  ) {
    return this.platform.setTheme(user, id, dto.themePreset, dto.themeTokens);
  }
}
