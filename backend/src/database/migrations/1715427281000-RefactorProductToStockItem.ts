import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorProductToStockItem1715427281000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // First check if stock_items table exists
      const stockItemsTableExists = await queryRunner.hasTable('stock_items');
      if (!stockItemsTableExists) {
        console.log('Creating stock_items table first');
        // Create stock_items table if it doesn't exist
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS stock_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR NOT NULL,
            description TEXT,
            "currentQuantity" DECIMAL(10,2) DEFAULT 0,
            "minimumQuantity" DECIMAL(10,2) DEFAULT 0,
            "costPrice" DECIMAL(10,2) DEFAULT 0,
            "sellingPrice" DECIMAL(10,2),
            unit VARCHAR NOT NULL,
            category VARCHAR,
            sku VARCHAR,
            location VARCHAR,
            "imageUrl" VARCHAR,
            barcode VARCHAR,
            type VARCHAR DEFAULT 'RAW',
            "lastPurchasePrice" DECIMAL(10,2) DEFAULT 0,
            "averageCostPrice" DECIMAL(10,2) DEFAULT 0,
            "supplierId" UUID,
            "bomId" UUID,
            "createdAt" TIMESTAMP DEFAULT now(),
            "updatedAt" TIMESTAMP DEFAULT now()
          );
        `);
      }

      // Check if stock_transactions table exists and if it has productId column
      const stockTransactionsExist = await queryRunner.hasTable('stock_transactions');
      if (stockTransactionsExist) {
        const hasProductIdColumn = await queryRunner.hasColumn('stock_transactions', 'productId');
        if (hasProductIdColumn) {
          // Update StockTransaction table to reference stockItem instead of product
          await queryRunner.query(`
            ALTER TABLE stock_transactions 
            RENAME COLUMN "productId" TO "stockItemId";
          `);
      
          // Update StockTransaction foreign key to reference stock_items
          await queryRunner.query(`
            ALTER TABLE stock_transactions
            DROP CONSTRAINT IF EXISTS "FK_stock_transactions_products_productId",
            ADD CONSTRAINT "FK_stock_transactions_stock_items_stockItemId"
            FOREIGN KEY ("stockItemId") REFERENCES stock_items(id)
            ON DELETE CASCADE;
          `);
        }
      }

      // Check if stock_count_items table exists and if it has productId column
      const stockCountItemsExist = await queryRunner.hasTable('stock_count_items');
      if (stockCountItemsExist) {
        const hasProductIdColumn = await queryRunner.hasColumn('stock_count_items', 'productId');
        if (hasProductIdColumn) {
          // Update any references in StockCount and StockCountItem tables
          await queryRunner.query(`
            ALTER TABLE stock_count_items
            RENAME COLUMN "productId" TO "stockItemId";
          `);
      
          // Update StockCountItem foreign key to reference stock_items
          await queryRunner.query(`
            ALTER TABLE stock_count_items
            DROP CONSTRAINT IF EXISTS "FK_stock_count_items_products_productId",
            ADD CONSTRAINT "FK_stock_count_items_stock_items_stockItemId"
            FOREIGN KEY ("stockItemId") REFERENCES stock_items(id)
            ON DELETE CASCADE;
          `);
        }
      }
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert foreign keys
    await queryRunner.query(`
      ALTER TABLE stock_count_items
      DROP CONSTRAINT IF EXISTS "FK_stock_count_items_stock_items_stockItemId",
      ADD CONSTRAINT "FK_stock_count_items_products_productId"
      FOREIGN KEY ("stockItemId") REFERENCES products(id)
      ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE stock_transactions
      DROP CONSTRAINT IF EXISTS "FK_stock_transactions_stock_items_stockItemId",
      ADD CONSTRAINT "FK_stock_transactions_products_productId"
      FOREIGN KEY ("stockItemId") REFERENCES products(id)
      ON DELETE CASCADE;
    `);

    // Rename columns back
    await queryRunner.query(`
      ALTER TABLE stock_count_items 
      RENAME COLUMN "stockItemId" TO "productId";
    `);

    await queryRunner.query(`
      ALTER TABLE stock_transactions 
      RENAME COLUMN "stockItemId" TO "productId";
    `);
  }
}
