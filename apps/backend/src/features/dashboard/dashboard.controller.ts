import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IDashboardOverview } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly billing: BillingService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard KPIs and widgets' })
  async overview(@CurrentUser() user: IAuthUser): Promise<IDashboardOverview> {
    await this.billing.assertModule(user.organizationId, 'dashboard');
    return {
      kpis: [
        {
          id: 'sales-today',
          labelKey: 'dashboard.kpi.salesToday',
          value: 128.4,
          unit: 'million',
          delta: 12,
          deltaUnit: 'percent',
          trend: 'up',
        },
        {
          id: 'gold-stock',
          labelKey: 'dashboard.kpi.goldStock',
          value: 42.8,
          unit: 'kg',
          delta: -2,
          deltaUnit: 'percent',
          trend: 'down',
        },
        {
          id: 'customers',
          labelKey: 'dashboard.kpi.customers',
          value: 1284,
          unit: 'count',
          delta: 8,
          deltaUnit: 'count',
          trend: 'up',
        },
        {
          id: 'margin',
          labelKey: 'dashboard.kpi.margin',
          value: 18.2,
          unit: 'percent',
          delta: 0.4,
          deltaUnit: 'percent',
          trend: 'up',
        },
      ],
      forecast: [
        { label: 'sat', value: 40 },
        { label: 'sun', value: 55 },
        { label: 'mon', value: 48 },
        { label: 'tue', value: 70 },
        { label: 'wed', value: 62 },
        { label: 'thu', value: 80 },
        { label: 'fri', value: 75 },
      ],
      activity: [
        { id: '1', titleKey: 'dashboard.activity.saleCompleted', time: '2m' },
        { id: '2', titleKey: 'dashboard.activity.purchaseReceived', time: '15m' },
        { id: '3', titleKey: 'dashboard.activity.stockAdjust', time: '1h' },
      ],
    };
  }
}
