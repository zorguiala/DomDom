import { MigrationInterface, QueryRunner } from 'typeorm';

export class InventoryEntitiesUpdate1714791748125 implements MigrationInterface {
  name = 'InventoryEntitiesUpdate1714791748125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add leadTimeDays column if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'leadTimeDays'
        ) THEN
          ALTER TABLE "products" ADD "leadTimeDays" integer NULL DEFAULT 0;
        END IF;
      END
      $$;
    `);

    // Add costPrice column if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'costPrice'
        ) THEN
          ALTER TABLE "products" ADD "costPrice" numeric(10,2) NULL DEFAULT 0;
        END IF;
      END
      $$;
    `);

    // Check if productId column already exists in inventory_transactions
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'inventory_transactions' AND column_name = 'productId'
        ) THEN
          ALTER TABLE "inventory_transactions" ADD "productId" uuid;
        END IF;
      END
      $$;
    `);

    // Check if foreign key constraint already exists before adding
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_inventory_transactions_products' AND table_name = 'inventory_transactions'
        ) THEN
          ALTER TABLE "inventory_transactions" 
          ADD CONSTRAINT "FK_inventory_transactions_products" 
          FOREIGN KEY ("productId") REFERENCES "products"("id");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_inventory_transactions_products' AND table_name = 'inventory_transactions'
        ) THEN
          ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_inventory_transactions_products";
        END IF;
      END
      $$;
    `);

    // Remove explicit productId column if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'inventory_transactions' AND column_name = 'productId'
        ) THEN
          ALTER TABLE "inventory_transactions" DROP COLUMN "productId";
        END IF;
      END
      $$;
    `);

    // Remove costPrice column if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'costPrice'
        ) THEN
          ALTER TABLE "products" DROP COLUMN "costPrice";
        END IF;
      END
      $$;
    `);

    // Remove leadTimeDays column if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'leadTimeDays'
        ) THEN
          ALTER TABLE "products" DROP COLUMN "leadTimeDays";
        END IF;
      END
      $$;
    `);
  }
}
