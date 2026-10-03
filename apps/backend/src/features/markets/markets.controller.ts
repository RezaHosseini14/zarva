import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ILiveRatesResponse } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { MarketsService } from './markets.service';

@ApiTags('Markets')
@ApiBearerAuth()
@Controller('markets')
export class MarketsController {
  constructor(
    private readonly billing: BillingService,
    private readonly markets: MarketsService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Live gold and USD rates' })
  async live(@CurrentUser() user: IAuthUser): Promise<ILiveRatesResponse> {
    await this.billing.assertModule(user.organizationId, 'dashboard');
    return this.markets.getLiveRates();
  }
}
