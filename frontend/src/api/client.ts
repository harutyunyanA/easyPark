import axios, { type InternalAxiosRequestConfig } from 'axios';

import {
  clearTokens,
  getTokens,
  saveTokens,
  type AuthTokens,
} from '@/lib/auth-storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Колбэк "сессия окончательно мертва" — зарегистрирует auth-провайдер (шаг 4).
// Транспортный слой не знает про React, поэтому разлогин делаем через него.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// --- request: в каждый запрос подставляем свежий accessToken ---
api.interceptors.request.use(async (config) => {
  const tokens = await getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// --- refresh с дедупликацией (single-flight) ---
// Параллельные 401 дёргают /auth/refresh ОДИН раз и ждут общий результат.
// Критично из-за ротации refresh на бэке: иначе второй запрос уйдёт со старым
// refresh-токеном и получит отказ → случайный разлогин.
let refreshPromise: Promise<AuthTokens | null> | null = null;

function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<AuthTokens | null> {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return null;
  try {
    // Голый axios, а не наш api — чтобы не навесить interceptors и не зациклиться.
    const { data } = await axios.post<AuthTokens>(`${baseURL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });
    if (!data?.accessToken || !data?.refreshToken) return null;
    await saveTokens(data);
    return data;
  } catch {
    return null;
  }
}

// --- response: ловим 401, рефрешим, повторяем исходный запрос один раз ---
type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableRequest | undefined;

    // Не 401 / нет конфига / уже пробовали ретрай — пробрасываем как есть.
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const refreshed = await refreshTokens();
    if (!refreshed) {
      // И refresh мёртв — чистим сессию и сигналим наверх (разлогин).
      await clearTokens();
      onUnauthorized?.();
      return Promise.reject(error);
    }

    // Токены обновлены — повторяем запрос (Bearer подставит request-interceptor).
    return api(original);
  },
);
