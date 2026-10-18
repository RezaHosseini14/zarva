import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CorrectGoldRateDto,
  CreateGoldLotDto,
  CreateGoldPurityDto,
  CreateGoldTxnDto,
  GoldCalculatorDto,
  LockGoldRateDto,
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

  @Get('summary')
  @ApiOperation({ summary: 'Gold stock and ledger summary KPIs' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.summary(user);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Gold metal ledger with running balance' })
  async ledger(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listLedger(user);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List gold transactions' })
  async txns(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.gold.listTxns(user);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Audited gold stock adjustment' })
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

  @Get('rates/today')
  @ApiOperation({ summary: 'Get locked rate for today (or query date)' })
  async todayRate(
    @CurrentUser() user: IAuthUser,
    @Query('date') date?: string,
  ) {
    await this.gate(user);
    return this.gold.todayRate(user, date);
  }

  @Post('rates/lock')
  @ApiOperation({ summary: 'Lock daily buy/sell gold rates' })
  async lockRate(@CurrentUser() user: IAuthUser, @Body() dto: LockGoldRateDto) {
    await this.gate(user);
    return this.gold.lockRate(user, dto);
  }

  @Post('rates/correct')
  @ApiOperation({ summary: 'Correct locked daily rates with audit reason' })
  async correctRate(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CorrectGoldRateDto,
  ) {
    await this.gate(user);
    return this.gold.correctRate(user, dto);
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
