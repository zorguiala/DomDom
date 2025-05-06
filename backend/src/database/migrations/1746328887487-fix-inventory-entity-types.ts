import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInventoryEntityTypes1746328887487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix inventory_batches notes column
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_batches' AND column_name = 'notes'
            ) THEN
                ALTER TABLE inventory_batches
                ALTER COLUMN notes TYPE varchar(500);
            END IF;
        END
        $$;
    `);

    // Fix inventory_wastage notes column
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_wastage' AND column_name = 'notes'
            ) THEN
                ALTER TABLE inventory_wastage
                ALTER COLUMN notes TYPE varchar(500);
            END IF;
        END
        $$;
    `);

    // Fix inventory_counts notes column
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_counts' AND column_name = 'notes'
            ) THEN
                ALTER TABLE inventory_counts
                ALTER COLUMN notes TYPE varchar(500);
            END IF;
        END
        $$;
    `);

    // Fix inventory_count_items notes column
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_count_items' AND column_name = 'notes'
            ) THEN
                ALTER TABLE inventory_count_items
                ALTER COLUMN notes TYPE varchar(500);
            END IF;
        END
        $$;
    `);

    // Fix any possibly wrong default values for columns that should be nullable but not null
    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_counts' AND column_name = 'completed_by_id'
            ) THEN
                ALTER TABLE inventory_counts
                ALTER COLUMN completed_by_id DROP NOT NULL,
                ALTER COLUMN completed_by_id DROP DEFAULT;
            END IF;
        END
        $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_count_items' AND column_name = 'batch_id'
            ) THEN
                ALTER TABLE inventory_count_items
                ALTER COLUMN batch_id DROP NOT NULL,
                ALTER COLUMN batch_id DROP DEFAULT;
            END IF;
        END
        $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_count_items' AND column_name = 'batch_number'
            ) THEN
                ALTER TABLE inventory_count_items
                ALTER COLUMN batch_number DROP NOT NULL,
                ALTER COLUMN batch_number DROP DEFAULT;
            END IF;
        END
        $$;
    `);

    await queryRunner.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_wastage' AND column_name = 'batch_id'
            ) THEN
                ALTER TABLE inventory_wastage
                ALTER COLUMN batch_id DROP NOT NULL,
                ALTER COLUMN batch_id DROP DEFAULT;
            END IF;
        END
        $$;
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This is a data type correction, so we don't provide a rollback option
    // as it would potentially corrupt data or cause errors
  }
}
