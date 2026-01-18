import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity, CustomerEntity } from '@/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, CustomerEntity])],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
