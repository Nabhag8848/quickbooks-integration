import { IsString, IsObject, IsDate } from 'class-validator';

export class UpsertCustomerDto {
  @IsString()
  companySourceId: string;

  @IsString()
  sourceId: string;

  @IsObject()
  rawData: Record<string, unknown>;

  @IsDate()
  sourceCreatedAt: Date;

  @IsDate()
  sourceUpdatedAt: Date;
}
