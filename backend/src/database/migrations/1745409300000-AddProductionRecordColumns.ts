import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddProductionRecordColumns1745409300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key columns
    await queryRunner.addColumns('production_records', [
      new TableColumn({
        name: 'employee_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'bom_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'production_order_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

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
    const table = await queryRunner.getTable('production_records');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('production_records', foreignKey);
      }
      await queryRunner.dropColumn('production_records', 'employee_id');
      await queryRunner.dropColumn('production_records', 'bom_id');
      await queryRunner.dropColumn('production_records', 'production_order_id');
    }
  }
}
