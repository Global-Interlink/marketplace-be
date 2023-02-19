import { MigrationInterface, QueryRunner } from "typeorm";

export class updateNftEntity1676810231564 implements MigrationInterface {
    name = 'updateNftEntity1676810231564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "nftType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "onChainId"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "onChainId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "onChainId"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "onChainId" integer`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "nftType"`);
    }

}
