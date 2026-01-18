import { Module } from '@nestjs/common';
import { IntegrationModule } from './integration/integration.module';
import { CompanyModule } from './company/company.module';
import { CustomerModule } from './customer/customer.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ApiModule } from './api/api.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [CompanyModule, CustomerModule, InvoiceModule, IntegrationModule, ApiModule, QueueModule],
  exports: [IntegrationModule, CompanyModule, CustomerModule, InvoiceModule, ApiModule, QueueModule],
})
export class ModulesModule {}
