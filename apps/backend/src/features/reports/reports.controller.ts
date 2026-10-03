import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly billing: BillingService,
  ) {}

  @Get(':kind')
  @ApiOperation({ summary: 'Aggregated report by kind' })
  async get(
    @CurrentUser() user: IAuthUser,
    @Param('kind') kind: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    await this.billing.assertModule(user.organizationId, 'reports');
    const allowed = ['sales', 'purchases', 'inventory', 'gold', 'profit'] as const;
    if (!(allowed as readonly string[]).includes(kind)) {
      return { period: '', total: '0', kpis: [], series: [] };
    }
    return this.reports.getReport(
      user,
      kind as (typeof allowed)[number],
      from,
      to,
    );
  }
}
