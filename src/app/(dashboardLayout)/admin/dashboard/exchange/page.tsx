import ExchangeTable from "@/components/modules/Admin/Exchange/ExchangeTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { exchangesListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Exchange",
};

const ExchangePage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(exchangesListQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Currency exchange</h1>
        <p className="text-sm text-muted-foreground">
          USD out, BDT in. Every taka the agency spends starts here.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <ExchangeTable />
      </QueryPrefetch>
    </div>
  );
};

export default ExchangePage;
