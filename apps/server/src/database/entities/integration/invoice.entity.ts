import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../base.entity';
import { CompanyEntity } from './company.entity';
import { CustomerEntity } from './customer.entity';

@Entity({ name: 'invoice', schema: 'integration' })
@Index(['companySourceId', 'sourceId'], { unique: true })
export class InvoiceEntity extends AbstractBaseEntity {
  @ManyToOne(() => CompanyEntity, (company) => company.invoices, { nullable: false })
  @JoinColumn({ name: 'companySourceId', referencedColumnName: 'sourceId' })
  company: CompanyEntity;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index()
  companySourceId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  sourceId: string; // QBO object Id

  @ManyToOne(() => CustomerEntity, (customer) => customer.invoices, { nullable: true })
  @JoinColumn({ 
    name: 'customerId', 
  })
  customer?: CustomerEntity;

  @Column({ type: 'varchar', nullable: true })
  customerId?: string; // CustomerRef.value extracted

  @Column({ type: 'jsonb', nullable: false })
  rawData: Record<string, unknown>; // Full raw object payload

  @Column({ type: 'timestamp', nullable: false })
  sourceCreatedAt: Date; // Metadata.CreateTime

  @Column({ type: 'timestamp', nullable: false })
  sourceUpdatedAt: Date; // Metadata.LastUpdatedTime
}