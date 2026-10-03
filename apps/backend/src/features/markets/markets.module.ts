import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { GoldApiProvider } from './gold-api.provider';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';
import { NavasanProvider } from './navasan.provider';
import { TgjuProvider } from './tgju.provider';

@Module({
  imports: [BillingModule],
  controllers: [MarketsController],
  providers: [MarketsService, GoldApiProvider, TgjuProvider, NavasanProvider],
  exports: [MarketsService],
})
export class MarketsModule {}
