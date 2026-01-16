import { Module } from '@nestjs/common';
import { IntegrationModule } from './integration/integration.module';
import { CompanyModule } from './company/company.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [CompanyModule, IntegrationModule, ApiModule],
  exports: [IntegrationModule, CompanyModule, ApiModule],
})
export class ModulesModule {}
