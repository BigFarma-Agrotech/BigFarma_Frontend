import { QueryClient } from '@tanstack/react-query';

const MAX_RETRIES = 3;

// Retry reads that failed for reasons a retry can fix: no response (network
// drop, or the Render backend waking up), timeouts, rate limits and server
// errors. Never retry 4xx answers like 401/403/404, which won't change.
const shouldRetry = (failureCount, error) => {
  if (failureCount >= MAX_RETRIES) return false;
  const status = error?.response?.status;
  return status === undefined || status === 408 || status === 429 || status >= 500;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (v5 name for cacheTime)
      retry: shouldRetry,
      // 1s, 2s, 4s (capped at 8s) between attempts
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Writes are never retried automatically: retrying a checkout or an order
      // update could do it twice
      retry: 0,
    },
  },
});
