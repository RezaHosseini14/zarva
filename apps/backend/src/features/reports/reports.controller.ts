import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { ReportsService } from './reports.service';

class ReopenDayCloseDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;
}

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly billing: BillingService,
  ) {}

  @Get('day-close')
  @ApiOperation({ summary: 'Day-close metal + cash summary' })
  async dayClose(
    @CurrentUser() user: IAuthUser,
    @Query('date') date?: string,
  ) {
    await this.billing.assertModule(user.organizationId, 'reports');
    return this.reports.getDayClose(user, date, false);
  }

  @Post('day-close')
  @ApiOperation({ summary: 'Sign off day-close for a business date' })
  async signOffDayClose(
    @CurrentUser() user: IAuthUser,
    @Query('date') date?: string,
  ) {
    await this.billing.assertModule(user.organizationId, 'reports');
    return this.reports.getDayClose(user, date, true);
  }

  @Post('day-close/reopen')
  @ApiOperation({ summary: 'Reopen a closed business day (admin)' })
  async reopenDayClose(
    @CurrentUser() user: IAuthUser,
    @Query('date') date: string | undefined,
    @Body() dto: ReopenDayCloseDto,
  ) {
    await this.billing.assertModule(user.organizationId, 'reports');
    return this.reports.reopenDayClose(user, date, dto.reason);
  }

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
