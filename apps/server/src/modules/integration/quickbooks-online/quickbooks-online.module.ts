import { Module, OnModuleInit } from '@nestjs/common';
import { OAuthRegistryService } from '../oauth/registry/oauth.registry';
import { QuickbooksOnlineOAuthService } from './services/quickbooks-online-oauth.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@/database/redis';
import { CompanyModule } from '@/modules/company/company.module';

@Module({
  imports: [
    HttpModule,
    RedisModule,
    CompanyModule,
  ],
  providers: [QuickbooksOnlineOAuthService],
  exports: [QuickbooksOnlineOAuthService],
})
export class QuickbooksOnlineModule implements OnModuleInit {
  constructor(
    private readonly oauthRegistryService: OAuthRegistryService,
    private readonly quickbooksOnlineOAuthService: QuickbooksOnlineOAuthService
  ) {}

  async onModuleInit() {
    this.oauthRegistryService.registerService(
      this.quickbooksOnlineOAuthService
    );
  }
}
