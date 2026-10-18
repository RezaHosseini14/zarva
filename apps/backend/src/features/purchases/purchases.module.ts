import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldModule } from '../gold/gold.module';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [BillingModule, GoldModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
