import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { EmployeeScheduleShift } from '../../entities/employee-schedule.entity';

export class CreateEmployeeSchedulesTable1746237355945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employee_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employee_id',
            type: 'uuid',
          },
          {
            name: 'shift',
            type: 'enum',
            enum: Object.values(EmployeeScheduleShift),
            default: `'${EmployeeScheduleShift.MORNING}'`,
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'employee_schedules',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employees',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('employee_schedules');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('employee_id') !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('employee_schedules', foreignKey);
      }
    }
    await queryRunner.dropTable('employee_schedules');
  }
}
