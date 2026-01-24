import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SyncJobDataDto } from '@/modules/integration/sync/dtos/sync-job-data.dto';
import { SyncRegistryService } from '@/modules/integration/sync/registry/sync.registry';
import { CompanyService } from '@/modules/company/company.service';
import { SyncContextDto } from '@/modules/integration/sync/dtos/sync-context.dto';
import { from, of, lastValueFrom, EMPTY, throwError } from 'rxjs';
import { expand, concatMap, finalize, catchError, takeWhile } from 'rxjs/operators';
import { SyncStateService } from '@/modules/integration/sync/services/sync-state.service';
import { IObjectTypeHandler } from '@/modules/integration/sync/interfaces/object-type-handler.interface';
import { SyncObjectType } from '@/utils';

@Processor('sync-incremental')
export class IncrementalProcessor extends WorkerHost {
  constructor(
    private readonly syncRegistryService: SyncRegistryService,
    private readonly companyService: CompanyService,
    private readonly syncStateService: SyncStateService
  ) {
    super();
  }
  async process(job: Job<SyncJobDataDto>): Promise<void> {
    const { integrationName, companySourceId, objectType } = job.data;
    const syncService = this.syncRegistryService.getService(integrationName);

    if (!syncService) {
      throw new Error(`Sync service for ${integrationName} not found`);
    }

    const objectTypeHandler = syncService.getObjectTypeHandler(objectType);
    const accessToken = await this.companyService.getAccessTokenBySourceId(
      companySourceId
    );

    if (!accessToken) {
      throw new Error(
        `Access token not found for company source ID: ${companySourceId}`
      );
    }

    const syncContext: SyncContextDto = {
      companySourceId,
      accessToken,
      objectType,
      integrationName,
    };

    const syncConfig = syncService.getSyncConfig();
    const pageSize = syncConfig.pageSize;

    await this.syncStateService.markIncrementalSyncInProgress(
      companySourceId,
      objectType
    );

    const syncState = await this.syncStateService.getSyncState(
      companySourceId,
      objectType
    );

    if (!syncState) {
      throw new Error(
        `Sync state not found for company ${companySourceId} and object type ${objectType}`
      );
    }

    const lastSuccessfulSyncTime = syncState.lastSuccessfulSyncTime;
    const lastAttemptTime = syncState.lastAttemptTime;
    const filter = lastSuccessfulSyncTime
      ? `Metadata.LastUpdatedTime >= '${lastSuccessfulSyncTime.toISOString()}'`
      : undefined;

    await this.startIncrementalSync(
      objectTypeHandler,
      syncContext,
      pageSize,
      companySourceId,
      objectType,
      lastAttemptTime,
      filter
    );
  }

  private async startIncrementalSync(
    objectTypeHandler: IObjectTypeHandler,
    syncContext: SyncContextDto,
    pageSize: number,
    companySourceId: string,
    objectType: SyncObjectType,
    lastAttemptTime?: Date,
    filter?: string
  ): Promise<void> {
    // Use RxJS for pagination - start from position 1
    // Mark as completed when observable finishes successfully
    await lastValueFrom(
      of({ startPosition: 1, hasMore: true }).pipe(
        expand(({ startPosition, hasMore }) => {
          // Stop if no more pages
          if (!hasMore) {
            return EMPTY;
          }

          // Fetch a page
          return from(
            objectTypeHandler.fetchPage(
              syncContext,
              startPosition,
              pageSize,
              filter
            )
          ).pipe(
            concatMap(async (response) => {
              // Save entities to database
              if (response.items.length > 0) {
                await objectTypeHandler.saveEntities(
                  companySourceId,
                  response.items
                );
              }

              // Return next position and whether to continue
              return {
                startPosition: response.nextStartPosition || startPosition,
                hasMore: response.hasMore && response.nextStartPosition !== undefined,
              };
            }),
            catchError((error) => {
              console.error(
                `Error during incremental sync for ${companySourceId}:${objectType}`,
                error.response?.data?.Fault || error
              );
              return throwError(() => error);
            })
          );
        }),
        // Stop expanding when hasMore is false
        takeWhile(({ hasMore }) => hasMore === true, true),
        finalize(async () => {
          await this.syncStateService.markIncrementalSyncCompleted(
            companySourceId,
            objectType,
            lastAttemptTime
          );
        })
      )
    );
  }
}
