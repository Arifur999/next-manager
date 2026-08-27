import VaultBoard from "@/components/modules/Admin/Vault/VaultBoard";
import { getCredentials } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault",
};

const VaultPage = async () => {
  const queryClient = new QueryClient();

  // The list carries masks only — real passwords are never part of it, so
  // prefetching here leaves nothing sensitive in the page payload.
  await queryClient.prefetchQuery({
    queryKey: ["credentials", ""],
    queryFn: () => getCredentials(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vault</h1>
        <p className="text-sm text-muted-foreground">
          Client logins, encrypted at rest. Revealing one is recorded against your name.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <VaultBoard />
      </HydrationBoundary>
    </div>
  );
};

export default VaultPage;
