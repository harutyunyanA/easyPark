import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider, useSession } from '@/providers/auth';
import { QueryProvider } from '@/providers/query';
import { ToastProvider } from '@/providers/toast';

export default function RootLayout() {
  return (
    // SafeAreaProvider поднят в корень, чтобы useSafeAreaInsets в ToastProvider
    // (он выше навигации) читал инсеты из него, а не искал провайдер внутри Stack.
    <SafeAreaProvider>
      <QueryProvider>
        <SessionProvider>
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </SessionProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useSession();

  // Пока читаем токены из хранилища — не рендерим навигацию, чтобы не мигал вход.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
