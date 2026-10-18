import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IDashboardInsight, IDashboardOverview } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly billing: BillingService,
    private readonly dashboard: DashboardService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard KPIs and widgets' })
  async overview(@CurrentUser() user: IAuthUser): Promise<IDashboardOverview> {
    await this.billing.assertModule(user.organizationId, 'dashboard');
    return this.dashboard.overview(user);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Rule-based dashboard insights from live data' })
  async insights(@CurrentUser() user: IAuthUser): Promise<ReadonlyArray<IDashboardInsight>> {
    await this.billing.assertModule(user.organizationId, 'dashboard');
    return this.dashboard.insights(user);
  }
}
