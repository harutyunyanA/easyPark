import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKENS_KEY = 'easypark.session';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

// expo-secure-store не работает на web — там падаем в localStorage.
async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKENS_KEY);
  }
  return SecureStore.getItemAsync(TOKENS_KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKENS_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(TOKENS_KEY, value);
}

async function deleteRaw(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKENS_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKENS_KEY);
}

export async function getTokens(): Promise<AuthTokens | null> {
  const raw = await readRaw();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthTokens;
    // Отсекаем кривой/устаревший формат (напр. старый одиночный токен-строку).
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await writeRaw(JSON.stringify(tokens));
}

export async function clearTokens(): Promise<void> {
  await deleteRaw();
}
