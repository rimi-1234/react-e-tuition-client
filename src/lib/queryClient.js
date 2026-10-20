import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data is fresh for a minute: back/forward navigation is instant
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => (error?.status && error.status < 500 ? false : count < 2),
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: { retry: false },
  },
});
