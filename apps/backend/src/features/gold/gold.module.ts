import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldController } from './gold.controller';
import { GoldLedgerService } from './gold-ledger.service';
import { GoldService } from './gold.service';

@Module({
  imports: [BillingModule],
  controllers: [GoldController],
  providers: [GoldService, GoldLedgerService],
  exports: [GoldService, GoldLedgerService],
})
export class GoldModule {}
