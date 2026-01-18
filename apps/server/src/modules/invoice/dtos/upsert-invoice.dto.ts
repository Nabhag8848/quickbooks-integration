import { IsString, IsObject, IsDate, IsOptional } from 'class-validator';

export class UpsertInvoiceDto {
  @IsString()
  companySourceId: string;

  @IsString()
  sourceId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsObject()
  rawData: Record<string, unknown>;

  @IsDate()
  sourceCreatedAt: Date;

  @IsDate()
  sourceUpdatedAt: Date;
}
