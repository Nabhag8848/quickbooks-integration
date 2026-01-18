import { Module } from '@nestjs/common';
import { QuickbooksOnlineModule } from './quickbooks-online/quickbooks-online.module';
import { OAuthModule } from './oauth/oauth.module';
import { SyncModule } from './sync/sync.module';
@Module({
  imports: [QuickbooksOnlineModule, OAuthModule, SyncModule],
  exports: [QuickbooksOnlineModule, OAuthModule, SyncModule],
})
export class IntegrationModule {}
