import { CustomerEntity } from '@/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>
  ) {}

  /**
   * Upsert customers
   * @param companySourceId - The company source ID
   * @param entities - Array of customer entities from QuickBooks API
   */
  async upsertCustomersBatch(
    companySourceId: string,
    entities: Array<{
      Id: string;
      MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
      };
      [key: string]: unknown;
    }>
  ): Promise<void> {
    const customersToUpsert = entities.map((entity) => ({
      companySourceId,
      sourceId: entity.Id,
      rawData: entity,
      sourceCreatedAt: new Date(entity.MetaData.CreateTime),
      sourceUpdatedAt: new Date(entity.MetaData.LastUpdatedTime),
    }));

    // Upsert all customers - TypeORM will handle the conflict resolution
    await this.customerRepository.upsert(customersToUpsert as any, {
      conflictPaths: ['companySourceId', 'sourceId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
