import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompanyTable1768545824972 implements MigrationInterface {
    name = 'CreateCompanyTable1768545824972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "integration"."company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sourceId" character varying(255) NOT NULL, "accessToken" text, "accessTokenExpiresAt" TIMESTAMP, "refreshToken" text, "refreshTokenExpiresAt" TIMESTAMP, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a69ad95dd67ca8c90c0e86e992" ON "integration"."company" ("sourceId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "integration"."IDX_a69ad95dd67ca8c90c0e86e992"`);
        await queryRunner.query(`DROP TABLE "integration"."company"`);
    }

}
