import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type ObjectMeta = {
  size: number;
  contentType: string | undefined;
};

/**
 * ConfigService.getOrThrow отсекает только undefined, а пустая строка в .env
 * доезжает до рантайма и ломает уже запросы к бакету. Тот же подход, что в
 * database.config.ts: падаем на старте.
 */
function required(config: ConfigService, name: string): string {
  const value = config.get<string>(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Cloudflare R2 через S3-совместимый API.
 * Файлы никогда не идут через бэк: клиент получает presigned URL и грузит
 * напрямую в бакет, а мы только подписываем ссылку и проверяем результат.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.bucket = required(config, 'R2_BUCKET');
    // Сюда подставляется либо pub-*.r2.dev, либо свой домен — поэтому в БД
    // лежит ключ объекта, а не готовый URL.
    this.publicBaseUrl = required(config, 'R2_PUBLIC_URL').replace(/\/+$/, '');

    this.client = new S3Client({
      // R2 не шардируется по регионам, но SDK требует непустой region.
      region: 'auto',
      endpoint: `https://${required(config, 'R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: required(config, 'R2_ACCESS_KEY_ID'),
        secretAccessKey: required(config, 'R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  createUploadUrl(key: string, contentType: string, expiresIn = 300) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn },
    );
  }

  /** null, если объекта нет — значит клиент не догрузил файл. */
  async getObjectMeta(key: string): Promise<ObjectMeta | null> {
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return { size: head.ContentLength ?? 0, contentType: head.ContentType };
    } catch (error) {
      if (error instanceof NotFound) {
        return null;
      }
      throw error;
    }
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /**
   * Удаление, которое не должно валить основной запрос: старый аватар уже
   * заменён в БД, и мусор в бакете — не причина отдавать пользователю ошибку.
   */
  async deleteObjectQuietly(key: string) {
    try {
      await this.deleteObject(key);
    } catch (error) {
      this.logger.error(
        `Failed to delete object ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  buildPublicUrl(key: string) {
    return `${this.publicBaseUrl}/${key}`;
  }
}
