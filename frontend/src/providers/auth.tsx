import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { setUnauthorizedHandler } from '@/api/client';
import {
  clearTokens,
  getTokens,
  saveTokens,
  type AuthTokens,
} from '@/lib/auth-storage';

type AuthContextValue = {
  // Сами токены лежат в secure-store (их читает api-client). Здесь — только флаг для UI/гардов.
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // При старте проверяем, есть ли уже сохранённая пара токенов.
  useEffect(() => {
    getTokens()
      .then((tokens) => setIsAuthenticated(!!tokens))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (tokens: AuthTokens) => {
    await saveTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setIsAuthenticated(false);
  }, []);

  // api-client при мёртвом refresh дёргает этот колбэк — гасим сессию в UI.
  useEffect(() => {
    setUnauthorizedHandler(() => setIsAuthenticated(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, signIn, signOut }),
    [isAuthenticated, isLoading, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}
