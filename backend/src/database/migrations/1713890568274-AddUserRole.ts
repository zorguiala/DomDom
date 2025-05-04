import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserRole } from '../../entities/user.entity';

export class AddUserRole1713890568274 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'manager', 'user')`
    );

    // Add the role column with default value
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'
    `);

    // Add durationHours column to employee_attendance table
    await queryRunner.query(
      `ALTER TABLE "employee_attendance" ADD COLUMN "durationHours" decimal(10,2) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the role column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);

    // Drop the enum type
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);

    // Drop durationHours column from employee_attendance table
    await queryRunner.query(`ALTER TABLE "employee_attendance" DROP COLUMN "durationHours"`);
  }
}
