import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { TaxAuthorityAdapter } from './tax.authority.adapter';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';

@Module({
  imports: [BillingModule],
  controllers: [TaxController],
  providers: [TaxService, TaxAuthorityAdapter],
  exports: [TaxService],
})
export class TaxModule {}
