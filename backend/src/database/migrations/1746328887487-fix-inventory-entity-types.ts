import { MigrationInterface, QueryRunner } from "typeorm";

export class FixInventoryEntityTypes1746328887487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix inventory_batches notes column
        await queryRunner.query(`
            ALTER TABLE inventory_batches
            ALTER COLUMN notes TYPE varchar(500)
        `);

        // Fix inventory_wastage notes column
        await queryRunner.query(`
            ALTER TABLE inventory_wastage
            ALTER COLUMN notes TYPE varchar(500)
        `);

        // Fix inventory_counts notes column
        await queryRunner.query(`
            ALTER TABLE inventory_counts
            ALTER COLUMN notes TYPE varchar(500)
        `);

        // Fix inventory_count_items notes column
        await queryRunner.query(`
            ALTER TABLE inventory_count_items
            ALTER COLUMN notes TYPE varchar(500)
        `);

        // Fix any possibly wrong default values for columns that should be nullable but not null
        await queryRunner.query(`
            ALTER TABLE inventory_counts
            ALTER COLUMN completed_by_id DROP NOT NULL,
            ALTER COLUMN completed_by_id DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TABLE inventory_count_items
            ALTER COLUMN batch_id DROP NOT NULL,
            ALTER COLUMN batch_id DROP DEFAULT,
            ALTER COLUMN batch_number DROP NOT NULL,
            ALTER COLUMN batch_number DROP DEFAULT
        `);

        await queryRunner.query(`
            ALTER TABLE inventory_wastage
            ALTER COLUMN batch_id DROP NOT NULL,
            ALTER COLUMN batch_id DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a data type correction, so we don't provide a rollback option
        // as it would potentially corrupt data or cause errors
    }

}
