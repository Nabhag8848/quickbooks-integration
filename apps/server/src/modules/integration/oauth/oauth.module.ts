import { Global, Module } from '@nestjs/common';
import { OAuthRegistryService } from './registry/oauth.registry';
import { OAuthController } from './controller/oauth.controller';

@Global()
@Module({
  controllers: [OAuthController],
  providers: [OAuthRegistryService],
  exports: [OAuthRegistryService],
})
export class OAuthModule {}
