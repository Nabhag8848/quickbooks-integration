import { Module } from '@nestjs/common';
import { IntegrationModule } from './integration/integration.module';
import { CompanyModule } from './company/company.module';
import { ApiModule } from './api/api.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [CompanyModule, IntegrationModule, ApiModule, QueueModule],
  exports: [IntegrationModule, CompanyModule, ApiModule, QueueModule],
})
export class ModulesModule {}
