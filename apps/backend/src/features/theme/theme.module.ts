import { Module } from '@nestjs/common';

import { BillingModule } from '../billing/billing.module';
import { ThemeController } from './theme.controller';

@Module({
  imports: [BillingModule],
  controllers: [ThemeController],
})
export class ThemeModule {}
