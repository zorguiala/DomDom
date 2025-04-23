import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class FixProductionRecordsTable1745409400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing table if it exists
    await queryRunner.dropTable('production_records', true);

    // Create the table with proper structure
    await queryRunner.createTable(
      new Table({
        name: 'production_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'wastage',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'startTime',
            type: 'timestamp',
          },
          {
            name: 'endTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'qualityChecked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'qualityNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'employee_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'bom_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'production_order_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'production_records',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employees',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'production_records',
      new TableForeignKey({
        columnNames: ['bom_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'boms',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'production_records',
      new TableForeignKey({
        columnNames: ['production_order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'production_orders',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('production_records', true);
  }
}
