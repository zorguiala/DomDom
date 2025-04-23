import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductionOrdersTable1713890568274_7 implements MigrationInterface {
    name = 'CreateProductionOrdersTable1713890568274_7'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."production_orders_status_enum" AS ENUM('planned', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."production_orders_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TABLE "production_orders" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "quantity" numeric(10,2) NOT NULL,
            "status" "public"."production_orders_status_enum" NOT NULL DEFAULT 'planned',
            "priority" "public"."production_orders_priority_enum" NOT NULL DEFAULT 'medium',
            "plannedStartDate" TIMESTAMP NOT NULL,
            "actualStartDate" TIMESTAMP,
            "completedDate" TIMESTAMP,
            "completedQuantity" numeric(10,2) NOT NULL DEFAULT '0',
            "notes" text,
            "bomId" uuid,
            "assignedToId" uuid,
            "createdById" uuid,
            CONSTRAINT "PK_44d72e026027e3448b5d655e16e" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD CONSTRAINT "FK_e01ab106eaf872aef04cddc858e" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD CONSTRAINT "FK_68140cdf831e1bc9cfa8e285c8e" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD CONSTRAINT "FK_d3fb1ddebdc091837735af3d3f5" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "production_orders" DROP CONSTRAINT "FK_d3fb1ddebdc091837735af3d3f5"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP CONSTRAINT "FK_68140cdf831e1bc9cfa8e285c8e"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP CONSTRAINT "FK_e01ab106eaf872aef04cddc858e"`);
        await queryRunner.query(`DROP TABLE "production_orders"`);
        await queryRunner.query(`DROP TYPE "public"."production_orders_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."production_orders_status_enum"`);
    }
} 