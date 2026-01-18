import { AbstractSyncService } from '@/modules/integration/sync/services/abstract-sync.service';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {ObjectTypeConfigDto, SyncConfigDto, SyncJobDataDto} from '@/modules/integration/sync/dtos';
import { InjectQueue } from '@nestjs/bullmq';
import { SyncObjectType } from '@/utils';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IObjectTypeHandler } from '@/modules/integration/sync/interfaces';
import { HttpService } from '@nestjs/axios';
import { QuickbooksCustomerHandler, QuickbooksInvoiceHandler } from '@/modules/integration/quickbooks-online/handler';
import { CustomerService } from '@/modules/customer/customer.service';
import { InvoiceService } from '@/modules/invoice/invoice.service';
import { SyncStateService } from '@/modules/integration/sync/services/sync-state.service';
import { SyncStateEntity } from '@/database/entities/integration/sync-state.entity';

@Injectable()
export class QuickbooksOnlineSyncService extends AbstractSyncService implements OnModuleInit {
    protected objectTypeHandlers: Map<SyncObjectType, IObjectTypeHandler> = new Map();

    constructor(
      @InjectQueue('sync-backfill') private readonly backfillQueue: Queue<SyncJobDataDto>,
      @InjectQueue('sync-incremental') private readonly incrementalQueue: Queue<SyncJobDataDto>,
      private readonly configService: ConfigService,
      private readonly httpService: HttpService,
      private readonly customerService: CustomerService,
      private readonly invoiceService: InvoiceService,
      private readonly syncStateService: SyncStateService,
    ) {
      super()
    }

    onModuleInit() {
      const baseUrl = this.configService.get<string>('QBO_API_BASE_URL');
      if (!baseUrl || baseUrl.trim() === '') {
        throw new Error('QBO_API_BASE_URL is not set');
      }
      this.baseUrl = baseUrl;
      this.objectTypeHandlers.set(SyncObjectType.CUSTOMER, new QuickbooksCustomerHandler(this.httpService, this.baseUrl, this.customerService));
      this.objectTypeHandlers.set(SyncObjectType.INVOICE, new QuickbooksInvoiceHandler(this.httpService, this.baseUrl, this.invoiceService));
    }

    readonly name = 'qbo';
    private baseUrl: string;

    async handleSync(companySourceId: string): Promise<void> {
      const objectTypes = this.getObjectTypes();
      const integrationName = this.name;
      const syncStates = await this.syncStateService.getSyncStatesByCompanySourceId(companySourceId);

      const syncStatesMap = new Map<SyncObjectType, SyncStateEntity>();

      for (const syncState of syncStates) {
        syncStatesMap.set(syncState.objectType, syncState);
      }

      for (const {objectType, priority} of objectTypes) {

        // check if exists in syncStatesMap, if it exists check if initialBackfillCompleted is false, if it is false then add to backfill queue
        // if it doesn't exist in syncStatesMap, then add to backfill queue
        if (syncStatesMap.has(objectType)) {

          if(!syncStatesMap.get(objectType)?.isInitialBackfillCompleted) {
            await this.addToBackfillQueue(companySourceId, objectType, integrationName, priority);
          }
        }
        else {
          await this.addToBackfillQueue(companySourceId, objectType, integrationName, priority);
          await this.syncStateService.createPendingSyncState(companySourceId, objectType);
        }
      }
      
    }

    async startIncrementalSync(companySourceId: string, objectType: SyncObjectType): Promise<void> {
      const integrationName = this.name;
      const objectTypePriority  = this.getObjectTypes().find(o => o.objectType === objectType);
      const syncConfig = this.getSyncConfig();

      if (!objectTypePriority) {
        throw new Error(`Object type priority not found for ${objectType}`);
      }

      const key = `${this.name}:incremental:${companySourceId}:${objectType}`;
      await this.incrementalQueue.add(key, {
        integrationName,
        companySourceId,
        objectType,
      }, {
        priority: objectTypePriority.priority,
        repeat: {
          every: syncConfig.incrementalSyncIntervalMs,
        },
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        attempts: 3,
      });
    }


    private async addToBackfillQueue(companySourceId: string, objectType: SyncObjectType, integrationName: string, priority: number): Promise<void> {
      const key = `${integrationName}:backfill:${companySourceId}:${objectType}`;
      await this.backfillQueue.add(key, {
        integrationName,
        companySourceId,
        objectType,
      }, {
        priority,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        attempts: 3,
      });
    }

    private getObjectTypes(): ObjectTypeConfigDto[] {
      return [
        {
          objectType: SyncObjectType.CUSTOMER,
          priority: 1,
        },
        {
          objectType: SyncObjectType.INVOICE,
          priority: 2,
        },
      ]
    }

    getSyncConfig(): SyncConfigDto {
      return {
        pageSize: 1000,
        rateLimitMs: 120, // 500 req/min = ~120ms between requests (not implemented yet)
        retryAttempts: 3,
        retryDelayMs: 1000,
        initialBackfillDelayMs: 5000, // 5 second delay after OAuth
        incrementalSyncIntervalMs: 5 * 60 * 1000, // 5 minutes
      }
    }
}