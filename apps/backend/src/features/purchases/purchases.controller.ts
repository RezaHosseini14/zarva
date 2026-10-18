import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { CreatePurchaseDto, CreatePurchaseReturnDto } from './dto/purchases.dto';
import { PurchasesService } from './purchases.service';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchases: PurchasesService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'purchases');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Purchases list KPIs' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.purchases.summary(user);
  }

  @Get()
  @ApiOperation({ summary: 'List purchases' })
  async list(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.purchases.list(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase' })
  async create(@CurrentUser() user: IAuthUser, @Body() dto: CreatePurchaseDto) {
    await this.gate(user);
    return this.purchases.create(user, dto);
  }

  @Get('returns')
  @ApiOperation({ summary: 'List purchase returns' })
  async returns(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.purchases.listReturns(user);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Create purchase return' })
  async createReturn(@CurrentUser() user: IAuthUser, @Body() dto: CreatePurchaseReturnDto) {
    await this.gate(user);
    return this.purchases.createReturn(user, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase' })
  async get(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.purchases.get(user, id);
  }
}
