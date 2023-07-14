import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKioskIdColumnIntoNftTable1689179231172 implements MigrationInterface {
    name = 'AddKioskIdColumnIntoNftTable1689179231172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "kioskId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "kioskId"`);
    }

}
