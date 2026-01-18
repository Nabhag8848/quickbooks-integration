import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntitySchema1768708360953 implements MigrationInterface {
    name = 'CreateEntitySchema1768708360953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "integration"."invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "companySourceId" character varying(255) NOT NULL, "sourceId" character varying(255) NOT NULL, "customerId" uuid, "rawData" jsonb NOT NULL, "sourceCreatedAt" TIMESTAMP NOT NULL, "sourceUpdatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_950ba4d41d9f65459acebe6e6e" ON "integration"."invoice" ("companySourceId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_293dcaca6115ef8361f8073650" ON "integration"."invoice" ("companySourceId", "sourceId") `);
        await queryRunner.query(`CREATE TABLE "integration"."customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "companySourceId" character varying(255) NOT NULL, "sourceId" character varying(255) NOT NULL, "rawData" jsonb NOT NULL, "sourceCreatedAt" TIMESTAMP NOT NULL, "sourceUpdatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae3a779f0cede3b8ac268b702f" ON "integration"."customer" ("companySourceId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b00ae96e094176542f4c15608f" ON "integration"."customer" ("companySourceId", "sourceId") `);
        await queryRunner.query(`CREATE TABLE "integration"."company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sourceId" character varying(255) NOT NULL, "accessToken" text, "accessTokenExpiresAt" TIMESTAMP, "refreshToken" text, "refreshTokenExpiresAt" TIMESTAMP, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a69ad95dd67ca8c90c0e86e992" ON "integration"."company" ("sourceId") `);
        await queryRunner.query(`ALTER TABLE "integration"."invoice" ADD CONSTRAINT "FK_950ba4d41d9f65459acebe6e6e7" FOREIGN KEY ("companySourceId") REFERENCES "integration"."company"("sourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integration"."invoice" ADD CONSTRAINT "FK_925aa26ea12c28a6adb614445ee" FOREIGN KEY ("customerId") REFERENCES "integration"."customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integration"."customer" ADD CONSTRAINT "FK_ae3a779f0cede3b8ac268b702fc" FOREIGN KEY ("companySourceId") REFERENCES "integration"."company"("sourceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration"."customer" DROP CONSTRAINT "FK_ae3a779f0cede3b8ac268b702fc"`);
        await queryRunner.query(`ALTER TABLE "integration"."invoice" DROP CONSTRAINT "FK_925aa26ea12c28a6adb614445ee"`);
        await queryRunner.query(`ALTER TABLE "integration"."invoice" DROP CONSTRAINT "FK_950ba4d41d9f65459acebe6e6e7"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_a69ad95dd67ca8c90c0e86e992"`);
        await queryRunner.query(`DROP TABLE "integration"."company"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_b00ae96e094176542f4c15608f"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_ae3a779f0cede3b8ac268b702f"`);
        await queryRunner.query(`DROP TABLE "integration"."customer"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_293dcaca6115ef8361f8073650"`);
        await queryRunner.query(`DROP INDEX "integration"."IDX_950ba4d41d9f65459acebe6e6e"`);
        await queryRunner.query(`DROP TABLE "integration"."invoice"`);
    }

}
