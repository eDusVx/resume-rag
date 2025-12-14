import { MigrationInterface, QueryRunner } from 'typeorm';

export class Log1765580870212 implements MigrationInterface {
  name = 'Log1765580870212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."log_type_enum" AS ENUM('LOG', 'SUCCESS', 'ERROR', 'WARNING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "process" character varying(255) NOT NULL, "log" text NOT NULL, "props" text NOT NULL, "result" text, "type" "public"."log_type_enum" NOT NULL, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log"`);
    await queryRunner.query(`DROP TYPE "public"."log_type_enum"`);
  }
}
