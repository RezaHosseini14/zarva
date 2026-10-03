import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { PlatformController } from './platform.controller';
import { PlatformSessionsController } from './platform-sessions.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [BillingModule, AuthModule],
  controllers: [PlatformController, PlatformSessionsController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
