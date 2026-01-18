import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SyncStateEntity } from "@/database/entities/integration/sync-state.entity";

@Injectable()
export class SyncStateService {
    constructor(@InjectRepository(SyncStateEntity) private readonly syncStateRepository: Repository<SyncStateEntity>) {}

}