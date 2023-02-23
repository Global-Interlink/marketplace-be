import { MigrationInterface, QueryRunner } from "typeorm";

export class addEventTable1677171130303 implements MigrationInterface {
    name = 'addEventTable1677171130303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event_log" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "transactionId" character varying NOT NULL, "eventId" character varying NOT NULL, "timestamp" character varying NOT NULL, "rawData" character varying NOT NULL, CONSTRAINT "PK_d8ccd9b5b44828ea378dd37e691" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fde3bf080648f0b8e4ef82ec94" ON "nft_collection" ("nftUrls") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fde3bf080648f0b8e4ef82ec94"`);
        await queryRunner.query(`DROP TABLE "event_log"`);
    }

}
