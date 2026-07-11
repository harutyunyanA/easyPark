import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParkingOffer1782303174105 implements MigrationInterface {
    name = 'AddParkingOffer1782303174105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."parking_offer_status_enum" AS ENUM('open', 'reserved', 'completed', 'cancelled', 'expired')`);
        await queryRunner.query(`CREATE TABLE "parking_offer" ("id" SERIAL NOT NULL, "ownerId" integer NOT NULL, "carId" integer, "latitude" numeric(9,6) NOT NULL, "longitude" numeric(9,6) NOT NULL, "address" character varying(255), "note" character varying(255), "status" "public"."parking_offer_status_enum" NOT NULL DEFAULT 'open', "leavingAt" TIMESTAMP WITH TIME ZONE, "expiresAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6713d1a912d6b8cded6b731049c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d77d6e5555aaf968a794d316b5" ON "parking_offer"  ("latitude", "longitude") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c399e3906fe7b13b2b5d89423" ON "parking_offer"  ("status") `);
        await queryRunner.query(`ALTER TABLE "parking_offer" ADD CONSTRAINT "FK_3fffa656e75e048cbf94848ad2d" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parking_offer" ADD CONSTRAINT "FK_a61c61c531446f05bc3030e1fa9" FOREIGN KEY ("carId") REFERENCES "car"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parking_offer" DROP CONSTRAINT "FK_a61c61c531446f05bc3030e1fa9"`);
        await queryRunner.query(`ALTER TABLE "parking_offer" DROP CONSTRAINT "FK_3fffa656e75e048cbf94848ad2d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c399e3906fe7b13b2b5d89423"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d77d6e5555aaf968a794d316b5"`);
        await queryRunner.query(`DROP TABLE "parking_offer"`);
        await queryRunner.query(`DROP TYPE "public"."parking_offer_status_enum"`);
    }

}
