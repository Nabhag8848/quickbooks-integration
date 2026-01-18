import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SyncJobDataDto } from "@/modules/integration/sync/dtos/sync-job-data.dto";
import { SyncRegistryService } from "@/modules/integration/sync/registry/sync.registry";
import { CompanyService } from "@/modules/company/company.service";
import { SyncContextDto } from "@/modules/integration/sync/dtos/sync-context.dto";
import { from, of, lastValueFrom, EMPTY } from "rxjs";
import { expand, concatMap, finalize } from "rxjs/operators";
import { SyncStateService } from "@/modules/integration/sync/services/sync-state.service";
@Processor('sync-backfill')
export class BackfillProcessor extends WorkerHost {
    constructor(
        private readonly syncRegistryService: SyncRegistryService,
        private readonly companyService: CompanyService,
        private readonly syncStateService: SyncStateService,
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
        const accessToken = await this.companyService.getAccessTokenBySourceId(companySourceId);

        if (!accessToken) {
            throw new Error(`Access token not found for company source ID: ${companySourceId}`);
        }

        const syncContext: SyncContextDto = {
            companySourceId,
            accessToken,
            objectType,
            integrationName,
        };

        await this.syncStateService.markInitialBackfillInProgress(companySourceId, objectType);
        
        // Use RxJS for pagination - start from position 1
        // Mark as completed when observable finishes successfully
        await lastValueFrom(
            of(1).pipe(
                expand((startPosition) => {
                    // Fetch a page
                    return from(
                        objectTypeHandler.fetchPage(syncContext, startPosition)
                    ).pipe(
                        concatMap(async (response) => {
                            // Save entities to database
                            if (response.items.length > 0) {
                                await objectTypeHandler.saveEntities(
                                    companySourceId,
                                    response.items
                                );
                            }

                            // Continue to next page if available
                            if (
                                response.hasMore &&
                                response.nextStartPosition !== undefined
                            ) {
                                return of(response.nextStartPosition);
                            }

                            // No more pages - complete the stream
                            return EMPTY;
                        }),
                        finalize(async () => {
                            await this.syncStateService.markInitialBackfillCompleted(companySourceId, objectType);
                        })
                    );
                })
            )
        );
    }
}