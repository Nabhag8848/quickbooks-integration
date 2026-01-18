import { AbstractSyncService } from '@/modules/integration/sync/services/abstract-sync.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuickbooksOnlineSyncService extends AbstractSyncService {
    readonly name = 'qbo';

    async handleSync(): Promise<void> {
      console.log('handleSync');
    }
}