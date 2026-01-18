import { AbstractSyncService } from '@/modules/integration/sync/services/abstract-sync.service';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {ObjectTypeConfigDto, SyncJobDataDto} from '@/modules/integration/sync/dtos';
import { InjectQueue } from '@nestjs/bullmq';
import { SyncObjectType } from '@/utils';
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IObjectTypeHandler } from '@/modules/integration/sync/interfaces';
import { HttpService } from '@nestjs/axios';
import { QuickbooksCustomerHandler, QuickbooksInvoiceHandler } from '@/modules/integration/quickbooks-online/handler';
import { CustomerService } from '@/modules/customer/customer.service';
import { InvoiceService } from '@/modules/invoice/invoice.service';

@Injectable()
export class QuickbooksOnlineSyncService extends AbstractSyncService implements OnModuleInit {
    protected objectTypeHandlers: Map<SyncObjectType, IObjectTypeHandler> = new Map();

    constructor(
      @InjectQueue('sync-backfill') private readonly backfillQueue: Queue<SyncJobDataDto>,
      private readonly configService: ConfigService,
      private readonly httpService: HttpService,
      private readonly customerService: CustomerService,
      private readonly invoiceService: InvoiceService,
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