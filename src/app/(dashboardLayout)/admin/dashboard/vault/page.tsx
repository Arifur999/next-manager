import VaultBoard from "@/components/modules/Admin/Vault/VaultBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { credentialsListQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Vault",
};

const VaultPage = async () => {

  // The list carries masks only — real passwords are never part of it, so
  // prefetching here leaves nothing sensitive in the page payload.
  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(credentialsListQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vault</h1>
        <p className="text-sm text-muted-foreground">
          Client logins, encrypted at rest. Revealing one is recorded against your name.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <VaultBoard />
      </QueryPrefetch>
    </div>
  );
};

export default VaultPage;
