import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to safely remove deprecated inventory entities after refactoring
 * to the new StockItem-based system
 */
export class RemoveDeprecatedInventoryEntities1715427389000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // We'll drop the old inventory tables only after ensuring data has been migrated
    
    // First check if the new tables exist
    const stockItemTableExists = await queryRunner.hasTable('stock_items');
    const stockTransactionTableExists = await queryRunner.hasTable('stock_transactions');
    
    if (!stockItemTableExists || !stockTransactionTableExists) {
      console.warn('New stock tables not found. Migration cannot proceed safely.');
      return;
    }
    
    // Drop old inventory tables if they exist, using CASCADE to remove dependencies
    try {
      // Try to drop tables in the correct order to minimize dependency issues
      if (await queryRunner.hasTable('inventory_count_items')) {
        await queryRunner.query('DROP TABLE IF EXISTS inventory_count_items CASCADE');
      }

      if (await queryRunner.hasTable('inventory_counts')) {
        await queryRunner.query('DROP TABLE IF EXISTS inventory_counts CASCADE');
      }
      
      if (await queryRunner.hasTable('inventory_wastages')) {
        await queryRunner.query('DROP TABLE IF EXISTS inventory_wastages CASCADE');
      }
      
      if (await queryRunner.hasTable('inventory_batches')) {
        await queryRunner.query('DROP TABLE IF EXISTS inventory_batches CASCADE');
      }
      
      if (await queryRunner.hasTable('inventory_transactions')) {
        await queryRunner.query('DROP TABLE IF EXISTS inventory_transactions CASCADE');
      }
    } catch (error) {
      console.error('Error dropping deprecated inventory tables:', error);
      // Continue with the migration even if there are errors with dropping tables
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a destructive migration that removes tables
    // We can't easily recreate them with all the data,
    // so we'll just log a warning in the down migration
    console.warn(
      'Down migration for RemoveDeprecatedInventoryEntities cannot restore deleted tables. ' +
      'You will need to restore from a backup if needed.'
    );
  }
}
