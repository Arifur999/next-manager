import VaultBoard from "@/components/modules/Admin/Vault/VaultBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { credentialsListQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Vault",
};

const VaultPage = async () => {

  // The list carries masks only — real passwords are never part of it, so
  // prefetching here leaves nothing sensitive in the page payload.
  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(credentialsListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Vault">
        Client logins, encrypted at rest. Revealing one is recorded against your name.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <VaultBoard />
      </QueryPrefetch>
    </div>
  );
};

export default VaultPage;
