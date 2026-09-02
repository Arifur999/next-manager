import ShareholdersBoard from "@/components/modules/Admin/Loans/ShareholdersBoard";
import {
  getAccounts,
  getDistributions,
  getShareholders,
} from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shareholders",
};

const ShareholdersPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["shareholders"], queryFn: () => getShareholders() }),
    queryClient.prefetchQuery({ queryKey: ["distributions"], queryFn: () => getDistributions() }),
    queryClient.prefetchQuery({ queryKey: ["accounts"], queryFn: () => getAccounts() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shareholders</h1>
        <p className="text-sm text-muted-foreground">
          Who owns the agency, and what has been paid to them. A distribution moves real
          money out of a real account but is never a cost — it is profit already earned,
          being handed over, so paying yourself does not change what you earned.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ShareholdersBoard />
      </HydrationBoundary>
    </div>
  );
};

export default ShareholdersPage;
