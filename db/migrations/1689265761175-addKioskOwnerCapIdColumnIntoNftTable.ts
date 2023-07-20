import { MigrationInterface, QueryRunner } from "typeorm";

export class addKioskOwnerCapIdColumnIntoNftTable1689265761175 implements MigrationInterface {
    name = 'addKioskOwnerCapIdColumnIntoNftTable1689265761175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" ADD "typeModule" character varying`);
        await queryRunner.query(`UPDATE event_log SET typeModule = "marketplace" WHERE typeModule IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" DROP COLUMN "typeModule"`);
    }
    
}
