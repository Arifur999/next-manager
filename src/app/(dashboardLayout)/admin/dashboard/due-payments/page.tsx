import DuePaymentsBoard from "@/components/modules/Admin/DuePayments/DuePaymentsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { duePeopleQuery, dueTransactionsListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Due Payments",
};

const DuePaymentsPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(duePeopleQuery()),
    queryClient.prefetchQuery(dueTransactionsListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Due payments</h1>
        <p className="text-sm text-muted-foreground">
          Informal lending, in and out. Kept apart from clients and team members — this balance is
          personal and does not belong in client revenue or team cost.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <DuePaymentsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default DuePaymentsPage;
