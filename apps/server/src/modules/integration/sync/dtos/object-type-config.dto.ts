import { SyncObjectType } from '@/utils';
import { IsEnum, IsNumber } from 'class-validator';

export class ObjectTypeConfigDto {
  @IsEnum(SyncObjectType)
  objectType: SyncObjectType;

  @IsNumber()
  priority: number; // Lower = higher priority (matches BullMQ)
}