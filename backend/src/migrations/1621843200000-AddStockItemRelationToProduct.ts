import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add stockItemId to Product table for migration to new Stock system
 * This enables a smooth transition from old inventory/product system to new StockItem-based system
 */
export class AddStockItemRelationToProduct1621843200000 implements MigrationInterface {
  name = 'AddStockItemRelationToProduct1621843200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add stockItemId column to products table
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stockItemId" uuid`
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_stock_items" FOREIGN KEY ("stockItemId") REFERENCES "stock_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );

    // Add categoryId column to products table
    await queryRunner.query(
      `ALTER TABLE "products" ADD "categoryId" varchar`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_stock_items"`);

    // Drop the stockItemId column
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stockItemId"`);

    // Drop the categoryId column
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryId"`);
  }
}
