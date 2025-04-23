import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductionOrderIdToProductionRecords1713890568274_6 implements MigrationInterface {
    name = 'AddProductionOrderIdToProductionRecords1713890568274_6'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_records" ADD "productionOrderId" uuid`);
        await queryRunner.query(`ALTER TABLE "production_records" ADD CONSTRAINT "FK_2d6b01999b2f88c97495d69dd83" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_records" DROP CONSTRAINT "FK_2d6b01999b2f88c97495d69dd83"`);
        await queryRunner.query(`ALTER TABLE "production_records" DROP COLUMN "productionOrderId"`);
    }
} 