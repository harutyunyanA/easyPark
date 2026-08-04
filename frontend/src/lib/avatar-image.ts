import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Аватар всегда квадрат 512×512 JPEG. Приводим к нему на клиенте, а не на бэке:
// фото с камеры весит 5–10 МБ, и гнать их в R2 (и потом раздавать) незачем.
// JPEG, а не WebP — единственный формат, который одинаково жмётся и на iOS,
// и на Android. Держим в синхроне с бэком: AVATAR_CONTENT_TYPES в avatar.dto.ts.
export const AVATAR_SIZE = 512;
export const AVATAR_CONTENT_TYPE = "image/jpeg";

export type PickAvatarResult =
  | { status: "picked"; uri: string; contentType: string }
  | { status: "cancelled" }
  | { status: "permission-denied" };

/**
 * Открывает галерею, даёт обрезать квадратом и приводит результат к 512×512 JPEG.
 * Возвращает локальный uri в кэше — его дальше грузим в R2 по presigned URL.
 */
export async function pickAvatarImage(): Promise<PickAvatarResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: "permission-denied" };
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    // На iOS даёт квадратный кроп сам, на Android квадрат задаёт aspect.
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (picked.canceled || !picked.assets[0]) {
    return { status: "cancelled" };
  }

  const asset = picked.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);

  // Кроп по центру страхует случаи, когда редактор вернул неквадратное фото
  // (например, юзер отменил кроп) — иначе resize растянул бы картинку.
  const side = Math.min(asset.width, asset.height);
  context.crop({
    originX: (asset.width - side) / 2,
    originY: (asset.height - side) / 2,
    width: side,
    height: side,
  });
  context.resize({ width: AVATAR_SIZE, height: AVATAR_SIZE });

  const image = await context.renderAsync();
  const result = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
  });

  return {
    status: "picked",
    uri: result.uri,
    contentType: AVATAR_CONTENT_TYPE,
  };
}
