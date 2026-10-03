import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldController } from './gold.controller';
import { GoldService } from './gold.service';

@Module({
  imports: [BillingModule],
  controllers: [GoldController],
  providers: [GoldService],
  exports: [GoldService],
})
export class GoldModule {}
