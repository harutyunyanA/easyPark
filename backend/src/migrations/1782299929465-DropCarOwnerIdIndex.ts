import { MigrationInterface, QueryRunner } from "typeorm";

export class DropCarOwnerIdIndex1782299929465 implements MigrationInterface {
    name = 'DropCarOwnerIdIndex1782299929465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_cce467b67e5d4a0012473f985e"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_cce467b67e5d4a0012473f985e" ON "car" USING btree ("ownerId") `);
    }

}
