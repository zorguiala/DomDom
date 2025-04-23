import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecordedByIdToEmployeeAttendance1713890568274_5 implements MigrationInterface {
    name = 'AddRecordedByIdToEmployeeAttendance1713890568274_5'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_attendance" ADD "recordedById" uuid`);
        await queryRunner.query(`ALTER TABLE "employee_attendance" ADD CONSTRAINT "FK_2af59deb911168f67333279fa4e" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_attendance" DROP CONSTRAINT "FK_2af59deb911168f67333279fa4e"`);
        await queryRunner.query(`ALTER TABLE "employee_attendance" DROP COLUMN "recordedById"`);
    }
}
