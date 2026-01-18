import { Module } from '@nestjs/common';
import { QuickbooksOnlineModule } from './quickbooks-online/quickbooks-online.module';
import { OAuthModule } from './oauth/oauth.module';
import { SyncModule } from './sync/sync.module';
import { QueueModule } from '@/modules/queue/queue.module';

@Module({
  imports: [QueueModule, QuickbooksOnlineModule, OAuthModule, SyncModule],
  exports: [QueueModule, QuickbooksOnlineModule, OAuthModule, SyncModule],
})
export class IntegrationModule {}
