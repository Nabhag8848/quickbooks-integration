import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SyncStateEntity } from "@/database/entities/integration/sync-state.entity";
import { SyncObjectType, SyncStatus } from "@/utils";

@Injectable()
export class SyncStateService {
    constructor(@InjectRepository(SyncStateEntity) private readonly syncStateRepository: Repository<SyncStateEntity>) {}

    async getSyncStatesByCompanySourceId(companySourceId: string): Promise<SyncStateEntity[]> {
        const syncStates = await this.syncStateRepository.find({
            where: {
                companySourceId,
            },
        });
        return syncStates;
    }

    async createPendingSyncState(companySourceId: string, objectType: SyncObjectType): Promise<void> {
        await this.syncStateRepository.insert({
            companySourceId,
            objectType,
            status: SyncStatus.PENDING,
        });
    }

    async getSyncState(companySourceId: string, objectType: SyncObjectType): Promise<SyncStateEntity | null> {
        return this.syncStateRepository.findOne({
            where: {
                companySourceId,
                objectType,
            },
        });
    }

    /**
     * Mark initial backfill as in progress
     * Checks if status is PENDING, then sets to IN_PROGRESS and sets initialAttemptTime
     */
    
    async markInitialBackfillInProgress(
        companySourceId: string,
        objectType: SyncObjectType
    ): Promise<void> {
        const syncState = await this.getSyncState(companySourceId, objectType);

        if (!syncState) {
            throw new Error(`Sync state not found for company ${companySourceId} and object type ${objectType}`);
        }

        if (syncState.status !== SyncStatus.PENDING) {
            throw new Error(
                `Cannot mark as in progress. Current status is ${syncState.status}, expected PENDING`
            );
        }

        const initialAttemptTime = new Date();
        await this.syncStateRepository.update(
            {
                companySourceId,
                objectType,
            },
            {
                status: SyncStatus.IN_PROGRESS,
                initialAttemptTime,
                lastAttemptTime: initialAttemptTime,
            }
        );

    }

    /**
     * Mark initial backfill as completed
     * Sets lastSuccessfulSyncTime = initialAttemptTime, isInitialBackfillCompleted = true, status = COMPLETED
     */
    async markInitialBackfillCompleted(
        companySourceId: string,
        objectType: SyncObjectType
    ): Promise<void> {
        const syncState = await this.getSyncState(companySourceId, objectType);

        if (!syncState) {
            throw new Error(`Sync state not found for company ${companySourceId} and object type ${objectType}`);
        }

        if (!syncState.initialAttemptTime) {
            throw new Error(`initialAttemptTime not set for company ${companySourceId} and object type ${objectType}`);
        }

        await this.syncStateRepository.update(
            {
                companySourceId,
                objectType,
            },
            {
                status: SyncStatus.COMPLETED,
                isInitialBackfillCompleted: true,
                lastSuccessfulSyncTime: syncState.initialAttemptTime,
                lastAttemptTime: syncState.initialAttemptTime,
            }
        );
    }

    /**
     * Mark initial backfill as failed
     * Sets status = FAILED
     */
    async markInitialBackfillFailed(
        companySourceId: string,
        objectType: SyncObjectType
    ): Promise<void> {
        await this.syncStateRepository.update(
            {
                companySourceId,
                objectType,
            },
            {
                status: SyncStatus.FAILED,
            }
        );
    }
}