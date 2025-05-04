import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToSales1713890568274_8 implements MigrationInterface {
  name = 'AddPaymentMethodToSales1713890568274_8';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."sales_payment_method_enum" AS ENUM('cash', 'credit_card', 'bank_transfer', 'check')
        `);
    await queryRunner.query(`
            ALTER TABLE "sales" ADD "paymentMethod" "public"."sales_payment_method_enum" DEFAULT 'cash'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sales" DROP COLUMN "paymentMethod"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."sales_payment_method_enum"
        `);
  }
}
