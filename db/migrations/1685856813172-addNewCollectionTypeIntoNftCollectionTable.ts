import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewCollectionTypeIntoNftCollectionTable1685856813172 implements MigrationInterface {
    name = 'AddNewCollectionTypeIntoNftCollectionTable1685856813172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "collectionType" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "collectionType"`);
    }

}
