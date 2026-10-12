import ShareholdersBoard from "@/components/modules/Admin/Loans/ShareholdersBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { accountsQuery, distributionsListQuery, shareholdersQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Shareholders",
};

const ShareholdersPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(shareholdersQuery()),
    queryClient.prefetchQuery(distributionsListQuery()),
    queryClient.prefetchQuery(accountsQuery()),
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

      <QueryPrefetch prefetch={prefetch}>
        <ShareholdersBoard />
      </QueryPrefetch>
    </div>
  );
};

export default ShareholdersPage;
