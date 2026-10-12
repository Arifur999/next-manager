import { isServer, QueryClient } from "@tanstack/react-query";

// One set of defaults for server prefetch and browser cache. A staleTime above
// zero keeps a just-hydrated query from refetching on the client straight away.
export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000 },
    },
  });

let browserQueryClient: QueryClient | undefined;

// The server gets a fresh client per call so requests never share a cache;
// the browser keeps one so a suspended render does not lose what is cached.
export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};
