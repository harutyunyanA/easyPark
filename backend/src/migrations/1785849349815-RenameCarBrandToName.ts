import { MigrationInterface, QueryRunner } from 'typeorm';

// Сущность называется CarBrand, поле — её имя, поэтому car_brand.brand → name:
// иначе в коде получается brand.brand. Пишем руками: migration:generate не умеет
// распознавать переименование и снёс бы колонку вместе со всеми брендами.
// Констрейнт переименовываем следом — его имя TypeORM выводит из имени колонки,
// и без этого следующий migration:generate захочет его пересоздать.
export class RenameCarBrandToName1785849349815 implements MigrationInterface {
  name = 'RenameCarBrandToName1785849349815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "car_brand" RENAME COLUMN "brand" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "car_brand" RENAME CONSTRAINT "UQ_eb8a7123894a4050ce101e24d8a" TO "UQ_fd0cc605fc786e24e1b24f6d10f"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "car_brand" RENAME CONSTRAINT "UQ_fd0cc605fc786e24e1b24f6d10f" TO "UQ_eb8a7123894a4050ce101e24d8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "car_brand" RENAME COLUMN "name" TO "brand"`,
    );
  }
}
