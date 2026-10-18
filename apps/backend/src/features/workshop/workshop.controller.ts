import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateArtisanDto,
  CreateProductionBatchDto,
  CreateWorkshopOrderDto,
} from './dto/workshop.dto';
import { WorkshopService } from './workshop.service';

@ApiTags('Workshop')
@ApiBearerAuth()
@Controller('workshop')
export class WorkshopController {
  constructor(
    private readonly workshop: WorkshopService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'workshop');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Workshop KPI counts' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.workshop.summary(user);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List workshop orders' })
  async orders(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.workshop.listOrders(user);
  }

  @Post('orders')
  async createOrder(@CurrentUser() user: IAuthUser, @Body() dto: CreateWorkshopOrderDto) {
    await this.gate(user);
    return this.workshop.createOrder(user, dto);
  }

  @Get('artisans')
  async artisans(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.workshop.listArtisans(user);
  }

  @Post('artisans')
  async createArtisan(@CurrentUser() user: IAuthUser, @Body() dto: CreateArtisanDto) {
    await this.gate(user);
    return this.workshop.createArtisan(user, dto);
  }

  @Get('production')
  async production(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.workshop.listProduction(user);
  }

  @Post('production')
  async createProduction(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateProductionBatchDto,
  ) {
    await this.gate(user);
    return this.workshop.createProduction(user, dto);
  }
}
