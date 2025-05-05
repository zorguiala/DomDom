import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddBomIdToProductionOrders1745409000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'production_orders',
      new TableColumn({
        name: 'bom_id',
        type: 'uuid',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'production_orders',
      new TableForeignKey({
        columnNames: ['bom_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'boms',
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('production_orders');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('bom_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('production_orders', foreignKey);
      }
      await queryRunner.dropColumn('production_orders', 'bom_id');
    }
  }
}
