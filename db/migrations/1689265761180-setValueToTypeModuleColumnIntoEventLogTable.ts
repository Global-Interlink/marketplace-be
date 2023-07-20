import { MigrationInterface, QueryRunner } from "typeorm";

export class setValueToTypeModuleColumnIntoEventLogTable1689265761180 implements MigrationInterface {
    name = 'setValueToTypeModuleColumnIntoEventLogTable1689265761180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE event_log SET "typeModule" = 'marketplace' WHERE "typeModule" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_log" DROP COLUMN "typeModule"`);
    }
    
}
