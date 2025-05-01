import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEmployeeEmailOptional1745408852567 implements MigrationInterface {
  name = 'MakeEmployeeEmailOptional1745408852567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing unique constraint
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "UQ_employees_email"`
    );
    // Make email column nullable
    await queryRunner.query(`ALTER TABLE "employees" ALTER COLUMN "email" DROP NOT NULL`);
    // Add unique constraint back but allow nulls
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_employees_email" ON "employees"("email") WHERE "email" IS NOT NULL`
    );
    // Remove redundant salary column
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "salary"`);
    // Remove redundant days columns as they should be calculated
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "daysAbsent"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "daysLate"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the redundant columns
    await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "salary" decimal(10,2)`);
    await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "daysAbsent" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "daysLate" integer DEFAULT 0`);
    // Remove partial unique index
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_employees_email"`);
    // Make email required again
    await queryRunner.query(`ALTER TABLE "employees" ALTER COLUMN "email" SET NOT NULL`);
    // Add back standard unique constraint
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "UQ_employees_email" UNIQUE ("email")`
    );
  }
}
