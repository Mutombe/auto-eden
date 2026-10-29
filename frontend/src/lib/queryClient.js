// One query cache for the whole app, so the public site and the admin console share
// prefetches and a page visited once opens instantly the next time.
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 20_000 },
    mutations: { retry: 0 },
  },
});
