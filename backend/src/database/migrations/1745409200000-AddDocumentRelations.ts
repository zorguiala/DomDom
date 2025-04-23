import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDocumentRelations1745409200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('documents', [
      new TableColumn({
        name: 'relatedEntityId',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'relatedEntityType',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('documents', 'relatedEntityId');
    await queryRunner.dropColumn('documents', 'relatedEntityType');
  }
}
