import { Global, Module } from '@nestjs/common';
import { OAuthRegistryService } from './registry/oauth.registry';
import { OAuthController } from './controller/oauth.controller';
import { CompanyModule } from '@/modules/company/company.module';

@Global()
@Module({
  imports: [CompanyModule],
  controllers: [OAuthController],
  providers: [OAuthRegistryService],
  exports: [OAuthRegistryService],
})
export class OAuthModule {}
