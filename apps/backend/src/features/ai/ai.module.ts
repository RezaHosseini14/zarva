import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [BillingModule, NotificationsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
