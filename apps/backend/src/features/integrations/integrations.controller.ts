import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { CreateIntegrationDto } from './dto/integrations.dto';
import { IntegrationsService } from './integrations.service';

class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;
}

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'integrations');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Integrations hub summary' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.integrations.summary(user);
  }

  @Get()
  @ApiOperation({ summary: 'List integrations' })
  async list(@CurrentUser() user: IAuthUser, @Query('kind') kind?: string) {
    await this.gate(user);
    return this.integrations.list(user, kind);
  }

  @Post()
  async create(@CurrentUser() user: IAuthUser, @Body() dto: CreateIntegrationDto) {
    await this.gate(user);
    return this.integrations.create(user, dto);
  }

  @Post(':id/test')
  async test(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.gate(user);
    return this.integrations.test(user, id);
  }

  @Post('api-keys')
  async createApiKey(@CurrentUser() user: IAuthUser, @Body() dto: CreateApiKeyDto) {
    await this.gate(user);
    return this.integrations.createApiKey(user, dto.name);
  }
}
