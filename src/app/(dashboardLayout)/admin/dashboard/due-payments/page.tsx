import DuePaymentsBoard from "@/components/modules/Admin/DuePayments/DuePaymentsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { duePeopleQuery, dueTransactionsListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Due payments",
};

const DuePaymentsPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(duePeopleQuery()),
    queryClient.prefetchQuery(dueTransactionsListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Due payments">
        Informal lending, in and out. Kept apart from clients and team members — this balance is
        personal and does not belong in client revenue or team cost.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <DuePaymentsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default DuePaymentsPage;
