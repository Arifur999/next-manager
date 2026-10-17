import TransactionsBoard from "@/components/modules/Admin/Transactions/TransactionsBoard";
import { TRANSACTIONS_TABLE } from "@/components/modules/Admin/Transactions/transactionsTable.config";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { transactionsListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Transactions",
};

const TransactionsPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  // Built from the same config as the board's, so the prefetched page is the
  // one the board asks for and the first paint is the view in the URL.
  const queryString = buildTableQueryString(await searchParams, TRANSACTIONS_TABLE);

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(transactionsListQuery(queryString));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Every movement of money, written by whatever caused it — a payment, an expense,
          an exchange. Nothing is typed in here, which is why it can be trusted to agree
          with the records it summarises.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <TransactionsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default TransactionsPage;
