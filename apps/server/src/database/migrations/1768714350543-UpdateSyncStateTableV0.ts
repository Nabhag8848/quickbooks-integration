import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSyncStateTableV01768714350543 implements MigrationInterface {
    name = 'UpdateSyncStateTableV01768714350543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration"."sync_state" ADD "lastSyncMostRecentSourceCreatedAtTime" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration"."sync_state" DROP COLUMN "lastSyncMostRecentSourceCreatedAtTime"`);
    }

}
