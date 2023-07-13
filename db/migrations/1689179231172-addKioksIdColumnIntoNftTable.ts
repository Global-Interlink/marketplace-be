import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKioksIdColumnIntoNftTable1689179231172 implements MigrationInterface {
    name = 'AddKioksIdColumnIntoNftTable1689179231172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "kioksId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "kioksId"`);
    }

}
