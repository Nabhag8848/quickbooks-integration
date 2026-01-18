import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SyncJobDataDto } from "../dtos/sync-job-data.dto";

@Processor('sync-backfill')
export class BackfillProcessor extends WorkerHost {
    async process(job: Job<SyncJobDataDto>): Promise<void> {
        console.log(job.data)
    }
}