import { makeQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Server Component: warm a fresh client, then hand the client tree its cache.
const QueryPrefetch = async ({
  prefetch,
  children,
}: {
  prefetch: (client: QueryClient) => Promise<unknown>;
  children: ReactNode;
}) => {
  const client = makeQueryClient();
  await prefetch(client);

  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
};

export default QueryPrefetch;
