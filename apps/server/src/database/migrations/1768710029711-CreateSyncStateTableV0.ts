import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSyncStateTableV01768710029711 implements MigrationInterface {
    name = 'CreateSyncStateTableV01768710029711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "integration"."sync_state_objecttype_enum" AS ENUM('customer', 'invoice')`);
        await queryRunner.query(`CREATE TYPE "integration"."sync_state_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'paused')`);
        await queryRunner.query(`CREATE TABLE "integration"."sync_state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "companySourceId" character varying(255) NOT NULL, "objectType" "integration"."sync_state_objecttype_enum" NOT NULL, "status" "integration"."sync_state_status_enum" NOT NULL DEFAULT 'pending', "isInitialBackfillCompleted" boolean NOT NULL DEFAULT false, "initialAttemptTime" TIMESTAMP, "lastAttemptTime" TIMESTAMP, "lastSuccessfulSyncTime" TIMESTAMP, CONSTRAINT "PK_4c68d03775b8818b4e50b6dba84" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4d6fce7d6a19f974ee7432a378" ON "integration"."sync_state" ("companySourceId", "objectType") `);
        await queryRunner.query(`ALTER TABLE "integration"."sync_state" ADD CONSTRAINT "FK_a9729ecb939e194b459f21de341" FOREIGN KEY ("companySourceId") REFERENCES "integration"."company"("sourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration"."sync_state" DROP CONSTRAINT "FK_a9729ecb939e194b459f21de341"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_4d6fce7d6a19f974ee7432a378"`);
        await queryRunner.query(`DROP TABLE "integration"."sync_state"`);
        await queryRunner.query(`DROP TYPE "integration"."sync_state_status_enum"`);
        await queryRunner.query(`DROP TYPE "integration"."sync_state_objecttype_enum"`);
    }

}
