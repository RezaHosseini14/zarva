import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldModule } from '../gold/gold.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [BillingModule, GoldModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
