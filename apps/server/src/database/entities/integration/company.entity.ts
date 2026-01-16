import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../base.entity';

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
}
