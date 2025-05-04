import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryManagementFeatures1746326436399 implements MigrationInterface {
  name = 'AddInventoryManagementFeatures1746326436399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "costPrice" numeric(10,2) NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "leadTimeDays" integer`);
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_f21250669a9728997c6d8f6f5da"`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "productId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."inventory_transactions_type_enum" RENAME TO "inventory_transactions_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_type_enum" AS ENUM('purchase', 'sale', 'production_in', 'production_out', 'adjustment', 'SALE_OUT', 'in', 'out', 'waste')`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "type" TYPE "public"."inventory_transactions_type_enum" USING "type"::"text"::"public"."inventory_transactions_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_f21250669a9728997c6d8f6f5da" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_f21250669a9728997c6d8f6f5da"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_type_enum_old" AS ENUM('purchase', 'sale', 'production_in', 'production_out', 'adjustment', 'SALE_OUT')`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "type" TYPE "public"."inventory_transactions_type_enum_old" USING "type"::"text"::"public"."inventory_transactions_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."inventory_transactions_type_enum_old" RENAME TO "inventory_transactions_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ALTER COLUMN "productId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_f21250669a9728997c6d8f6f5da" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "leadTimeDays"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "costPrice"`);
  }
}
