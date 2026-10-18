import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { PlatformNavigationController } from '../platform/platform-navigation.controller';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';

@Module({
  imports: [BillingModule, forwardRef(() => AuthModule)],
  controllers: [NavigationController, PlatformNavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
