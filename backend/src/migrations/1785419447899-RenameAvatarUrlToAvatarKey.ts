import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameAvatarUrlToAvatarKey1785419447899 implements MigrationInterface {
    name = 'RenameAvatarUrlToAvatarKey1785419447899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "avatarURL" TO "avatarKey"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "avatarKey" TO "avatarURL"`);
    }

}
