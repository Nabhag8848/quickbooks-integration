import { IsNumber } from 'class-validator';

export class SyncConfigDto {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  rateLimitMs: number;

  @IsNumber()
  retryAttempts: number;

  @IsNumber()
  retryDelayMs: number;

  @IsNumber()
  initialBackfillDelayMs: number;

  @IsNumber()
  incrementalSyncIntervalMs: number;
}