import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryToStockMigration1746542187750 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename inventory_transactions table to stock_transactions
    await queryRunner.query(`ALTER TABLE "inventory_transactions" RENAME TO "stock_transactions"`);

    // Rename inventory_counts table to stock_counts
    await queryRunner.query(`ALTER TABLE "inventory_counts" RENAME TO "stock_counts"`);

    // Rename inventory_count_items table to stock_count_items
    await queryRunner.query(`ALTER TABLE "inventory_count_items" RENAME TO "stock_count_items"`);

    // Add new columns to products table
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "average_cost_price" decimal(10,2) DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "total_value_in_stock" decimal(10,2) DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "total_sold_quantity" integer DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "profit_margin" decimal(10,2) DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_alert" boolean DEFAULT false`
    );

    // Add new columns to stock_transactions table
    await queryRunner.query(
      `ALTER TABLE "stock_transactions" ADD COLUMN IF NOT EXISTS "related_entity_id" varchar`
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transactions" ADD COLUMN IF NOT EXISTS "related_entity_type" varchar`
    );

    // Update product references in stock_transactions
    await queryRunner.query(`
      UPDATE "stock_transactions" 
      SET "type" = 'adjustment' 
      WHERE "type" NOT IN ('purchase', 'sale', 'production_in', 'production_out', 'adjustment')
    `);

    // Calculate and update profit margins for all products
    await queryRunner.query(`
      UPDATE "products" 
      SET "profit_margin" = 
        CASE 
          WHEN "cost_price" > 0 THEN (("price" - "cost_price") / "cost_price") * 100
          ELSE 0
        END
    `);

    // Calculate and update total value in stock
    await queryRunner.query(`
      UPDATE "products" 
      SET "total_value_in_stock" = "current_stock" * "cost_price"
    `);

    // Update low stock alert status
    await queryRunner.query(`
      UPDATE "products" 
      SET "low_stock_alert" = ("current_stock" <= "minimum_stock")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert column additions to products table
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "average_cost_price"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "total_value_in_stock"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "total_sold_quantity"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "profit_margin"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "low_stock_alert"`);

    // Revert column additions to stock_transactions table
    await queryRunner.query(
      `ALTER TABLE "stock_transactions" DROP COLUMN IF EXISTS "related_entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transactions" DROP COLUMN IF EXISTS "related_entity_type"`
    );

    // Rename tables back to original names
    await queryRunner.query(`ALTER TABLE "stock_count_items" RENAME TO "inventory_count_items"`);
    await queryRunner.query(`ALTER TABLE "stock_counts" RENAME TO "inventory_counts"`);
    await queryRunner.query(`ALTER TABLE "stock_transactions" RENAME TO "inventory_transactions"`);
  }
}
