import { IsIn, IsString, MaxLength } from 'class-validator';

// Что реально может отдать expo-image-manipulator. webp первым — самый лёгкий.
export const AVATAR_CONTENT_TYPES = [
  'image/webp',
  'image/jpeg',
  'image/png',
] as const;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

// Хватает на выбор фото и заливку даже на слабой мобильной сети.
export const AVATAR_UPLOAD_URL_TTL_SECONDS = 300;

export class CreateAvatarUploadUrlDto {
  @IsIn(AVATAR_CONTENT_TYPES)
  contentType!: (typeof AVATAR_CONTENT_TYPES)[number];
}

export class ConfirmAvatarDto {
  @IsString()
  @MaxLength(255)
  key!: string;
}
