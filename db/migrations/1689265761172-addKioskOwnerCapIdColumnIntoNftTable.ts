import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKioskOwnerCapIdColumnIntoNftTable1689179231172 implements MigrationInterface {
    name = 'AddKioskOwnerCapIdColumnIntoNftTable1689179231172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" ADD "kioskOwnerCapId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "kioskOwnerCapId"`);
    }

}
