import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './features/health/health.module';
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { MarketsModule } from './features/markets/markets.module';
import { ThemeModule } from './features/theme/theme.module';
import { BillingModule } from './features/billing/billing.module';
import { RolesModule } from './features/roles/roles.module';
import { OrganizationModule } from './features/organization/organization.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { SalesModule } from './features/sales/sales.module';
import { CatalogModule } from './features/catalog/catalog.module';
import { AccountingModule } from './features/accounting/accounting.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { PurchasesModule } from './features/purchases/purchases.module';
import { GoldModule } from './features/gold/gold.module';
import { WorkshopModule } from './features/workshop/workshop.module';
import { SettingsModule } from './features/settings/settings.module';
import { ReportsModule } from './features/reports/reports.module';
import { SearchModule } from './features/search/search.module';
import { IntegrationsModule } from './features/integrations/integrations.module';
import { BranchesModule } from './features/branches/branches.module';
import { CommerceModule } from './features/commerce/commerce.module';
import { TaxModule } from './features/tax/tax.module';
import { JewelryModule } from './features/jewelry/jewelry.module';
import { AiModule } from './features/ai/ai.module';
import { SmsModule } from './features/sms/sms.module';
import { RedisModule } from './features/sms/redis.module';
import { PlatformModule } from './features/platform/platform.module';
import { NavigationModule } from './features/navigation/navigation.module';
import { EmailModule } from './features/email/email.module';
import { JwtAuthGuard } from './features/auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    PrismaModule,
    RedisModule,
    SmsModule,
    EmailModule,
    HealthModule,
    AuthModule,
    DashboardModule,
    MarketsModule,
    ThemeModule,
    BillingModule,
    PlatformModule,
    NavigationModule,
    RolesModule,
    OrganizationModule,
    NotificationsModule,
    SalesModule,
    CatalogModule,
    AccountingModule,
    InventoryModule,
    PurchasesModule,
    GoldModule,
    WorkshopModule,
    SettingsModule,
    ReportsModule,
    SearchModule,
    IntegrationsModule,
    BranchesModule,
    CommerceModule,
    TaxModule,
    JewelryModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
