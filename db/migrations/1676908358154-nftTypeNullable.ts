import { MigrationInterface, QueryRunner } from "typeorm";

export class nftTypeNullable1676908358154 implements MigrationInterface {
    name = 'nftTypeNullable1676908358154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "nftType" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "nftType" SET NOT NULL`);
    }

}
