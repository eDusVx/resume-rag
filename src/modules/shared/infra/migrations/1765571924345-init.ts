import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765571924345 implements MigrationInterface {
    name = 'Init1765571924345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "embedding" vector, "resumeId" uuid NOT NULL, CONSTRAINT "PK_7f9060084e9b872dbb567193978" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resumes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c8677802096d6baece48429d2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_75e237e9477cd3f2e8293ce31f0" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_75e237e9477cd3f2e8293ce31f0"`);
        await queryRunner.query(`DROP TABLE "resumes"`);
        await queryRunner.query(`DROP TABLE "document_chunks"`);
    }

}
