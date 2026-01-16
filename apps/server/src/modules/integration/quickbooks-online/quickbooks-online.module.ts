import { Module, OnModuleInit } from '@nestjs/common';
import { OAuthRegistryService } from '../oauth/registry/oauth.registry';
import { QuickbooksOnlineOAuthService } from './services/quickbooks-online-oauth.service';

@Module({
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
