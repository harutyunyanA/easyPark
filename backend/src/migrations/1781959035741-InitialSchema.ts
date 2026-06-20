import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781959035741 implements MigrationInterface {
    name = 'InitialSchema1781959035741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying, "refreshTokenHash" character varying, "name" character varying(255) NOT NULL, "phone" character varying, "avatarURL" character varying, "isVerified" boolean NOT NULL DEFAULT false, "verificationCodeHash" character varying, "verificationCodeExpiresAt" TIMESTAMP WITH TIME ZONE, "isActive" boolean NOT NULL DEFAULT false, "tokenBalance" integer NOT NULL DEFAULT '5', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "CHK_b7315eae4b1bedd6eeec2be405" CHECK ("tokenBalance" >= 0), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."car_color_enum" AS ENUM('white', 'black', 'gray', 'silver', 'red', 'blue', 'green', 'yellow', 'orange', 'brown', 'beige', 'gold', 'purple', 'pink', 'bronze', 'other')`);
        await queryRunner.query(`CREATE TABLE "car" ("id" SERIAL NOT NULL, "ownerId" integer NOT NULL, "brandId" integer NOT NULL, "model" character varying(100) NOT NULL, "color" "public"."car_color_enum" NOT NULL DEFAULT 'white', "plate" character varying(16) NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55bbdeb14e0b1d7ab417d11ee6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cce467b67e5d4a0012473f985e" ON "car"  ("ownerId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9e20e553e8c36277d65eebd7c3" ON "car"  ("ownerId", "plate") `);
        await queryRunner.query(`CREATE TABLE "car_brand" ("id" SERIAL NOT NULL, "brand" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_eb8a7123894a4050ce101e24d8a" UNIQUE ("brand"), CONSTRAINT "PK_cbaa76a620e6e21773085a96bf1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "car" ADD CONSTRAINT "FK_cce467b67e5d4a0012473f985ea" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car" ADD CONSTRAINT "FK_728700aee449838965f5cf87cee" FOREIGN KEY ("brandId") REFERENCES "car_brand"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car" DROP CONSTRAINT "FK_728700aee449838965f5cf87cee"`);
        await queryRunner.query(`ALTER TABLE "car" DROP CONSTRAINT "FK_cce467b67e5d4a0012473f985ea"`);
        await queryRunner.query(`DROP TABLE "car_brand"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e20e553e8c36277d65eebd7c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cce467b67e5d4a0012473f985e"`);
        await queryRunner.query(`DROP TABLE "car"`);
        await queryRunner.query(`DROP TYPE "public"."car_color_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
