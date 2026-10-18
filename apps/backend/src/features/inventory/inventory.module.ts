import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldModule } from '../gold/gold.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [BillingModule, GoldModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
