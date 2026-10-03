import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { UpdateSettingsSectionDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get(':section')
  @ApiOperation({ summary: 'Get org settings section' })
  async get(@CurrentUser() user: IAuthUser, @Param('section') section: string) {
    return this.settings.getSection(user, section);
  }

  @Put(':section')
  @ApiOperation({ summary: 'Update org settings section' })
  async put(
    @CurrentUser() user: IAuthUser,
    @Param('section') section: string,
    @Body() dto: UpdateSettingsSectionDto,
  ) {
    return this.settings.putSection(user, section, dto);
  }
}
