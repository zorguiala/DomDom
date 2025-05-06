import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryManagementFeatures1746326436399 implements MigrationInterface {
  name = 'AddInventoryManagementFeatures1746326436399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add costPrice if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'costPrice'
        ) THEN
          ALTER TABLE "products" ADD "costPrice" numeric(10,2) NOT NULL DEFAULT '0';
        END IF;
      END
      $$;
    `);

    // Add leadTimeDays if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'leadTimeDays'
        ) THEN
          ALTER TABLE "products" ADD "leadTimeDays" integer;
        END IF;
      END
      $$;
    `);

    // Check if the constraint exists before dropping
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_f21250669a9728997c6d8f6f5da'
        ) THEN
          ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_f21250669a9728997c6d8f6f5da";
        END IF;
      END
      $$;
    `);

    // Set productId NOT NULL if it exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'inventory_transactions' AND column_name = 'productId'
        ) THEN
          ALTER TABLE "inventory_transactions" ALTER COLUMN "productId" SET NOT NULL;
        END IF;
      END
      $$;
    `);

    // Update enum type for inventory transactions
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_type 
          WHERE typname = 'inventory_transactions_type_enum'
        ) THEN
          ALTER TYPE "public"."inventory_transactions_type_enum" RENAME TO "inventory_transactions_type_enum_old";
          
          CREATE TYPE "public"."inventory_transactions_type_enum" AS ENUM('purchase', 'sale', 'production_in', 'production_out', 'adjustment', 'SALE_OUT', 'in', 'out', 'waste');
          
          ALTER TABLE "inventory_transactions" 
          ALTER COLUMN "type" TYPE "public"."inventory_transactions_type_enum" 
          USING "type"::"text"::"public"."inventory_transactions_type_enum";
          
          DROP TYPE "public"."inventory_transactions_type_enum_old";
        END IF;
      END
      $$;
    `);

    // Add the foreign key constraint
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_f21250669a9728997c6d8f6f5da'
        ) THEN
          ALTER TABLE "inventory_transactions" 
          ADD CONSTRAINT "FK_f21250669a9728997c6d8f6f5da" 
          FOREIGN KEY ("productId") REFERENCES "products"("id") 
          ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // These operations should be safe as they check if things exist before dropping
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_f21250669a9728997c6d8f6f5da'
        ) THEN
          ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_f21250669a9728997c6d8f6f5da";
        END IF;
      END
      $$;
    `);

    // Only try to drop costPrice if it exists
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

    // Only try to drop leadTimeDays if it exists
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
