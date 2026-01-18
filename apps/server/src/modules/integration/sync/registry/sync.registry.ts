import { Injectable } from '@nestjs/common';
import { AbstractSyncService } from '@/modules/integration/sync/services/abstract-sync.service';

@Injectable()
export class SyncRegistryService {
  private readonly syncServices: Map<string, AbstractSyncService> = new Map();

  /**
   * Register a sync service for an integration
   */
  registerService(service: AbstractSyncService): void {
    this.syncServices.set(service.name, service);
  }

  /**
   * Get a sync service for an integration
   */
  getService(name: string): AbstractSyncService | undefined {
    return this.syncServices.get(name);
  }
}