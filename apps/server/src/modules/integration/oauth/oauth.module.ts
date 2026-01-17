import { Global, Module } from '@nestjs/common';
import { OAuthRegistryService } from './registry/oauth.registry';
import { OAuthController } from './controller/oauth.controller';
import { CompanyModule } from '@/modules/company/company.module';
import { AccessTokenRefreshService } from './services/access-token-refresh.service';
import { RedisModule } from '@/database/redis';

@Global()
@Module({
  imports: [CompanyModule, RedisModule],
  controllers: [OAuthController],
  providers: [OAuthRegistryService, AccessTokenRefreshService],
  exports: [OAuthRegistryService, AccessTokenRefreshService],
})
export class OAuthModule {}
