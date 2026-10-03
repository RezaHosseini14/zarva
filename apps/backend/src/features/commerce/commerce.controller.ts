import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { CommerceService } from './commerce.service';
import {
  CreateCommerceChannelDto,
  CreateCommerceListingDto,
  UpdateCommerceChannelDto,
} from './dto/commerce.dto';

@ApiTags('Commerce')
@ApiBearerAuth()
@Controller('commerce')
export class CommerceController {
  constructor(
    private readonly commerce: CommerceService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'commerce');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Commerce summary counts' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.commerce.summary(user);
  }

  @Get('channels')
  async listChannels(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.commerce.listChannels(user);
  }

  @Post('channels')
  async createChannel(@CurrentUser() user: IAuthUser, @Body() dto: CreateCommerceChannelDto) {
    await this.gate(user);
    return this.commerce.createChannel(user, dto);
  }

  @Patch('channels/:id')
  async updateChannel(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommerceChannelDto,
  ) {
    await this.gate(user);
    return this.commerce.updateChannel(user, id, dto);
  }

  @Delete('channels/:id')
  async removeChannel(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.commerce.removeChannel(user, id);
  }

  @Post('listings')
  async createListing(@CurrentUser() user: IAuthUser, @Body() dto: CreateCommerceListingDto) {
    await this.gate(user);
    return this.commerce.createListing(user, dto);
  }
}
