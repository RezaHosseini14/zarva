import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [BillingModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
