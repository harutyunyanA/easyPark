import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useState, type PropsWithChildren } from 'react';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 4xx не ретраим: 401 разрулит refresh-interceptor, а 403/404 от повтора
        // не починятся. Сетевые/5xx — пара попыток.
        retry: (failureCount, error) => {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status && status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        staleTime: 30_000,
      },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  // Клиент создаём один раз на маунт провайдера.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
