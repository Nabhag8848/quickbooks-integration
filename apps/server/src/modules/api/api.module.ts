import { Module } from '@nestjs/common';
import { CompanyModule } from '@/modules/company/company.module';
import { CompanyController } from './company/company.controller';

@Module({
  imports: [CompanyModule],
  controllers: [CompanyController],
})
export class ApiModule {}
