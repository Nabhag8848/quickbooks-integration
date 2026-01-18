import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../base.entity';
import { CompanyEntity } from './company.entity';

enum SyncObjectType {
  CUSTOMER = 'customer',
  INVOICE = 'invoice',
}

enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

@Entity({ name: 'sync_state', schema: 'integration' })
@Index(['companySourceId', 'objectType'], { unique: true })
export class SyncStateEntity extends AbstractBaseEntity {
  @ManyToOne(() => CompanyEntity, { nullable: false })
  @JoinColumn({ name: 'companySourceId', referencedColumnName: 'sourceId' })
  company: CompanyEntity;

  @Column({ type: 'varchar', length: 255, nullable: false })
  companySourceId: string;

  @Column({
    type: 'enum',
    enum: SyncObjectType,
    nullable: false,
  })
  objectType: SyncObjectType;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
    nullable: false,
  })
  status: SyncStatus;

  @Column({ type: 'boolean', default: false, nullable: false })
  isInitialBackfillCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  initialAttemptTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAttemptTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessfulSyncTime?: Date;
}