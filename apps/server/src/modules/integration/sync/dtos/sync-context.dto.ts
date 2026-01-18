import { SyncObjectType } from '@/utils';
import { IsEnum, IsString } from 'class-validator';

export class SyncContextDto {
  @IsString()
  companySourceId: string;

  @IsString()
  accessToken: string;

  @IsEnum(SyncObjectType)
  objectType: SyncObjectType;

  @IsString()
  integrationName: string;
}