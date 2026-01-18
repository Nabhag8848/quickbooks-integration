import { Global, Module } from '@nestjs/common';
import { SyncStateService } from './services/sync-state.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncStateEntity } from '@/database/entities/integration/sync-state.entity';
import { SyncRegistryService } from './registry/sync.registry';
import { BackfillProcessor } from './processors/backfill.processor';

@Global() 
@Module({
  imports: [TypeOrmModule.forFeature([SyncStateEntity])],
  providers: [SyncStateService, SyncRegistryService, BackfillProcessor],
  exports: [SyncStateService, SyncRegistryService],
})
export class SyncModule {}