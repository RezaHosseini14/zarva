import { BadRequestException, Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional } from 'class-validator';
import type { IThemeTokens } from '@zarva/shared';
import { DEFAULT_THEME_PRESET, isThemePresetId, THEME_PRESETS } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';

class UpdateThemeDto {
  @ApiProperty({ required: false, enum: THEME_PRESETS })
  @IsOptional()
  @IsIn([...THEME_PRESETS])
  preset?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  tokens?: IThemeTokens;
}

const DEFAULT_TOKENS: IThemeTokens = {
  preset: DEFAULT_THEME_PRESET,
  primary: '#C9A227',
  background: '#0B0D10',
  foreground: '#F5F5F4',
  accent: '#E8C547',
  muted: '#1A1D23',
  card: '#12151A',
  border: '#2A2F38',
};

@ApiTags('Theme')
@ApiBearerAuth()
@Controller('theme')
export class ThemeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Org theme tokens' })
  async get(@CurrentUser() user: IAuthUser) {
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return {
      preset: org.themePreset,
      tokens: (org.themeTokens as IThemeTokens | null) ?? {
        ...DEFAULT_TOKENS,
        preset: org.themePreset,
      },
      presets: THEME_PRESETS,
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update org theme' })
  async update(@CurrentUser() user: IAuthUser, @Body() dto: UpdateThemeDto) {
    if (dto.preset && !isThemePresetId(dto.preset)) {
      throw new BadRequestException('Invalid theme preset');
    }

    if (dto.preset) {
      const entitlements = await this.billing.resolveEntitlements(user.organizationId);
      const canCustomize =
        entitlements.features.includes('theme.custom') ||
        user.roleName === 'SUPER_ADMIN' ||
        user.roleName === 'PLATFORM_ADMIN';
      if (!canCustomize) {
        throw new BadRequestException('Theme customization not in plan');
      }
    }

    const org = await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        themePreset: dto.preset ?? undefined,
        themeTokens: dto.tokens ? (dto.tokens as object) : undefined,
      },
    });
    return {
      preset: org.themePreset,
      tokens: (org.themeTokens as IThemeTokens | null) ?? {
        ...DEFAULT_TOKENS,
        preset: org.themePreset,
      },
      presets: THEME_PRESETS,
    };
  }
}
