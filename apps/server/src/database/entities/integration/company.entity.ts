import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../base.entity';
import { CustomerEntity } from './customer.entity';
import { InvoiceEntity } from './invoice.entity';

@Entity({ name: 'company', schema: 'integration' })
export class CompanyEntity extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index({ unique: true })
  sourceId: string; // QuickBooks company ID (realmId)

  @Column({ type: 'text', nullable: true })
  accessToken?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  accessTokenExpiresAt?: Date;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  refreshTokenExpiresAt?: Date;

  @OneToMany(() => CustomerEntity, (customer) => customer.company)
  customers: CustomerEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.company)
  invoices?: InvoiceEntity[];
}
