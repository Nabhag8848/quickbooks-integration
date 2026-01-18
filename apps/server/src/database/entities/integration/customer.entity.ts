import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../base.entity';
import { CompanyEntity } from './company.entity';
import { InvoiceEntity } from './invoice.entity';

@Entity({ name: 'customer', schema: 'integration' })
@Index(['companySourceId', 'sourceId'], { unique: true })
export class CustomerEntity extends AbstractBaseEntity {
  @ManyToOne(() => CompanyEntity, (company) => company.customers, { nullable: false })
  @JoinColumn({ name: 'companySourceId', referencedColumnName: 'sourceId' })
  company: CompanyEntity;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index()
  companySourceId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  sourceId: string; // QBO Customer Id

  @Column({ type: 'jsonb', nullable: false })
  rawData: Record<string,unknown>; // Full raw object payload

  @Column({ type: 'timestamp', nullable: false })
  sourceCreatedAt: Date; // Metadata.CreateTime

  @Column({ type: 'timestamp', nullable: false })
  sourceUpdatedAt: Date; // Metadata.LastUpdatedTime

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.customer)
  invoices?: InvoiceEntity[];
}