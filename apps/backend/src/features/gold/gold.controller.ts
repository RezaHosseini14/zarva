import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateGoldLotDto,
  CreateGoldPurityDto,
  CreateGoldTxnDto,
  GoldCalculatorDto,
} from './dto/gold.dto';
import { GoldService } from './gold.service';

@ApiTags('Gold')
@ApiBearerAuth()
@Controller('gold')
export class GoldController {
  constructor(
    private readonly gold: GoldService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'gold');
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List gold transactions' })
  async txns(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listTxns(user);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create gold transaction' })
  async createTxn(@CurrentUser() user: IAuthUser, @Body() dto: CreateGoldTxnDto) {
    await this.gate(user);
    return this.gold.createTxn(user, dto);
  }

  @Get('purities')
  async purities(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listPurities(user);
  }

  @Post('purities')
  async createPurity(@CurrentUser() user: IAuthUser, @Body() dto: CreateGoldPurityDto) {
    await this.gate(user);
    return this.gold.createPurity(user, dto);
  }

  @Get('lots')
  async lots(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listLots(user);
  }

  @Post('lots')
  async createLot(@CurrentUser() user: IAuthUser, @Body() dto: CreateGoldLotDto) {
    await this.gate(user);
    return this.gold.createLot(user, dto);
  }

  @Get('balance')
  async balance(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listBalances(user);
  }

  @Get('rates')
  async rates(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listRates(user);
  }

  @Get('melted')
  async melted(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listMeltedRaw(user, 'melted');
  }

  @Get('raw')
  async raw(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listMeltedRaw(user, 'raw');
  }

  @Post('calculator')
  @ApiOperation({ summary: 'Compute gold value' })
  async calculator(@CurrentUser() user: IAuthUser, @Body() dto: GoldCalculatorDto) {
    await this.gate(user);
    return this.gold.calculate(dto);
  }
}
