import { AbstractSyncService } from '@/modules/integration/sync/services/abstract-sync.service';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {ObjectTypeConfigDto, SyncJobDataDto} from '@/modules/integration/sync/dtos';
import { InjectQueue } from '@nestjs/bullmq';
import { SyncObjectType } from '@/utils';

@Injectable()
export class QuickbooksOnlineSyncService extends AbstractSyncService {

    constructor(@InjectQueue('sync-backfill') private readonly backfillQueue: Queue<SyncJobDataDto>) {
      super()
    }
    readonly name = 'qbo';

    async handleSync(companySourceId: string): Promise<void> {
      const objectTypes = this.getObjectTypes();
      const integrationName = this.name;
      for (const {objectType, priority} of objectTypes) {
        const key = `${integrationName}:backfill:${companySourceId}:${objectType}`;
        await this.backfillQueue.add(key, {
          integrationName,
          companySourceId,
          objectType,  
        }, {
          priority
        });
      }
      
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
}