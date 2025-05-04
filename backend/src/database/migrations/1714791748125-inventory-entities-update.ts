import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryEntitiesUpdate1714791748125 implements MigrationInterface {
  name = 'InventoryEntitiesUpdate1714791748125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add leadTimeDays and costPrice columns to the product table
    await queryRunner.query(`ALTER TABLE "product" ADD "leadTimeDays" integer NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "product" ADD "costPrice" numeric(10,2) NULL DEFAULT 0`);

    // Add explicit productId column to inventory_transaction table
    await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD "productId" uuid`);

    // Update productId foreign key from product reference
    await queryRunner.query(
      `UPDATE "inventory_transaction" SET "productId" = "product"."id" FROM "product" WHERE "inventory_transaction"."productId" IS NULL AND "inventory_transaction"."productId" = "product"."id"`
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_inventory_transaction_product" FOREIGN KEY ("productId") REFERENCES "product"("id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_inventory_transaction_product"`
    );

    // Remove explicit productId column
    await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP COLUMN "productId"`);

    // Remove leadTimeDays and costPrice columns from product table
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "costPrice"`);
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "leadTimeDays"`);
  }
}
