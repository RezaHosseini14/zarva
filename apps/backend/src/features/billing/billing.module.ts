import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { NotificationsModule } from '../notifications/notifications.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { MockBillingProvider } from './mock-billing.provider';
import { StripeBillingProvider } from './stripe-billing.provider';
import { SubscriptionLifecycleService } from './subscription-lifecycle.service';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    MockBillingProvider,
    StripeBillingProvider,
    SubscriptionLifecycleService,
  ],
  exports: [BillingService, SubscriptionLifecycleService],
})
export class BillingModule {}
