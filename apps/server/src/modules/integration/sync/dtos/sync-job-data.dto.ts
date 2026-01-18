import { IsEnum, IsString } from 'class-validator';
import { SyncObjectType } from '@/utils';

export class SyncJobDataDto {
  @IsString()
  integrationName: string;

  @IsString()
  companySourceId: string;

  @IsEnum(SyncObjectType)
  objectType: SyncObjectType;
}