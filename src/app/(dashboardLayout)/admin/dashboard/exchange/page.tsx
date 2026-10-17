import ExchangeTable from "@/components/modules/Admin/Exchange/ExchangeTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { exchangesListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Exchange",
};

const ExchangePage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(exchangesListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Currency exchange">
        USD out, BDT in. Every taka the agency spends starts here.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <ExchangeTable />
      </QueryPrefetch>
    </div>
  );
};

export default ExchangePage;
