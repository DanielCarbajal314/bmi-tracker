import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Failures are reported once, here. A failed query is toasted only when it already had
// data: on a first load the component renders the error inline.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) toast.error(error.message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => toast.error(error.message),
    }),
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  });
}
