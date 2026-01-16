import { Module } from '@nestjs/common';
import { QuickbooksOnlineModule } from './quickbooks-online/quickbooks-online.module';
import { OAuthModule } from './oauth/oauth.module';
@Module({
  imports: [QuickbooksOnlineModule, OAuthModule],
  exports: [QuickbooksOnlineModule, OAuthModule],
})
export class IntegrationModule {}
