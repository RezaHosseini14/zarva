import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { JewelryController } from './jewelry.controller';
import { JewelryService } from './jewelry.service';

@Module({
  imports: [BillingModule],
  controllers: [JewelryController],
  providers: [JewelryService],
  exports: [JewelryService],
})
export class JewelryModule {}
