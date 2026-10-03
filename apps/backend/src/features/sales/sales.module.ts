import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { SmsModule } from '../sms/sms.module';
import { SaleSmsNotifier } from './sale-sms.notifier';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [SmsModule, BillingModule],
  controllers: [SalesController],
  providers: [SalesService, SaleSmsNotifier],
  exports: [SalesService, SaleSmsNotifier],
})
export class SalesModule {}
