import { Module, OnModuleInit } from '@nestjs/common';
import { OAuthRegistryService } from '@/modules/integration/oauth/registry/oauth.registry';
import { QuickbooksOnlineOAuthService } from './services/quickbooks-online-oauth.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@/database/redis';
import { CompanyModule } from '@/modules/company/company.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { InvoiceModule } from '@/modules/invoice/invoice.module';
import { SyncRegistryService } from '@/modules/integration/sync/registry/sync.registry';
import { QuickbooksOnlineSyncService } from './services/quickbooks-online-sync.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sync-backfill',
    }),
    HttpModule,
    RedisModule,
    CompanyModule,
    CustomerModule,
    InvoiceModule,
  ],
  providers: [QuickbooksOnlineOAuthService, QuickbooksOnlineSyncService],
  exports: [QuickbooksOnlineOAuthService, QuickbooksOnlineSyncService],
})
export class QuickbooksOnlineModule implements OnModuleInit {
  constructor(
    private readonly oauthRegistryService: OAuthRegistryService,
    private readonly quickbooksOnlineOAuthService: QuickbooksOnlineOAuthService,
    private readonly quickbooksOnlineSyncService: QuickbooksOnlineSyncService,
    private readonly syncRegistryService: SyncRegistryService
  ) {}

  async onModuleInit() {
    this.oauthRegistryService.registerService(
      this.quickbooksOnlineOAuthService
    );

    this.syncRegistryService.registerService(
      this.quickbooksOnlineSyncService
    );
  }
}
