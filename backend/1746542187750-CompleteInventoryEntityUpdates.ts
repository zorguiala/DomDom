import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteInventoryEntityUpdates1746542187750 implements MigrationInterface {
    name = 'CompleteInventoryEntityUpdates1746542187750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boms" ADD "productionTimeInHours" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD "batchPrefix" character varying`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD "isBatchProduction" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD "batchSize" integer`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD "batchCount" integer`);
        await queryRunner.query(`ALTER TABLE "production_records" ADD "batchNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "production_records" ADD "batchExpiryDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "production_records" ADD "batchLocation" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."production_orders_status_enum" RENAME TO "production_orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."production_orders_status_enum" AS ENUM('planned', 'in_progress', 'completed', 'cancelled', 'on_hold')`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" TYPE "public"."production_orders_status_enum" USING "status"::"text"::"public"."production_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" SET DEFAULT 'planned'`);
        await queryRunner.query(`DROP TYPE "public"."production_orders_status_enum_old"`);
        
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'inventory_batches' AND column_name = 'lead_time_days'
                ) THEN
                    ALTER TABLE inventory_batches
                    ADD COLUMN lead_time_days integer;
                END IF;
            END
            $$;
        `);
        
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'inventory_counts' AND column_name = 'has_error'
                ) THEN
                    ALTER TABLE inventory_counts
                    ADD COLUMN has_error boolean DEFAULT false;
                END IF;
            END
            $$;
        `);
        
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'inventory_counts' AND column_name = 'error_message'
                ) THEN
                    ALTER TABLE inventory_counts
                    ADD COLUMN error_message text;
                END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_counts" DROP COLUMN IF EXISTS "error_message"`);
        await queryRunner.query(`ALTER TABLE "inventory_counts" DROP COLUMN IF EXISTS "has_error"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN IF EXISTS "lead_time_days"`);
        
        await queryRunner.query(`CREATE TYPE "public"."production_orders_status_enum_old" AS ENUM('planned', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" TYPE "public"."production_orders_status_enum_old" USING "status"::"text"::"public"."production_orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "production_orders" ALTER COLUMN "status" SET DEFAULT 'planned'`);
        await queryRunner.query(`DROP TYPE "public"."production_orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."production_orders_status_enum_old" RENAME TO "production_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "production_records" DROP COLUMN "batchLocation"`);
        await queryRunner.query(`ALTER TABLE "production_records" DROP COLUMN "batchExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "production_records" DROP COLUMN "batchNumber"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP COLUMN "batchCount"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP COLUMN "batchSize"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP COLUMN "isBatchProduction"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP COLUMN "batchPrefix"`);
        await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "productionTimeInHours"`);
    }

}
