import { InvoiceEntity, CustomerEntity } from '@/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>
  ) {}

  /**
   * Upsert invoices
   * @param companySourceId - The company source ID
   * @param entities - Array of invoice entities from QuickBooks API
   */
  async upsertInvoicesBatch(
    companySourceId: string,
    entities: Array<{
      Id: string;
      MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
      };
      CustomerRef?: {
        value: string;
        name?: string;
      };
      [key: string]: unknown;
    }>
  ): Promise<void> {
    // Get all customer sourceIds from the invoices
    const customerSourceIds = entities
      .map((entity) => entity.CustomerRef?.value)
      .filter((id): id is string => Boolean(id));

    // Fetch all customers by their sourceIds to get their internal IDs
    const customers = await this.customerRepository.find({
      where: {
        companySourceId,
        sourceId: In(customerSourceIds),
      },
      select: ['id', 'sourceId'],
    });

    // Create a map of customer sourceId -> internal customer ID
    const customerMap = new Map(
      customers.map((customer) => [customer.sourceId, customer.id])
    );

    const invoicesToUpsert = entities.map((entity) => {
      const customerSourceId = entity.CustomerRef?.value;
      const customerId = customerSourceId
        ? customerMap.get(customerSourceId)
        : undefined;

      return {
        companySourceId,
        sourceId: entity.Id,
        customerId,
        rawData: entity,
        sourceCreatedAt: new Date(entity.MetaData.CreateTime),
        sourceUpdatedAt: new Date(entity.MetaData.LastUpdatedTime),
      };
    });

    // Upsert all invoices - TypeORM will handle the conflict resolution
    await this.invoiceRepository.upsert(invoicesToUpsert as any, {
      conflictPaths: ['companySourceId', 'sourceId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
