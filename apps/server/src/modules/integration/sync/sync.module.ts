import { Global, Module } from '@nestjs/common';
import { SyncStateService } from './services/sync-state.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncStateEntity } from '@/database/entities/integration/sync-state.entity';
import { SyncRegistryService } from './registry/sync.registry';
import { BackfillProcessor } from './processors/backfill.processor';
import { CompanyModule } from '@/modules/company/company.module';
import { IncrementalProcessor } from './processors/incremental.processor';

@Global() 
@Module({
  imports: [TypeOrmModule.forFeature([SyncStateEntity]), CompanyModule],
  providers: [SyncStateService, SyncRegistryService, BackfillProcessor, IncrementalProcessor],
  exports: [SyncStateService, SyncRegistryService],
})
export class SyncModule {}