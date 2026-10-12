import TransactionsBoard from "@/components/modules/Admin/Transactions/TransactionsBoard";
import type { QueryClient } from "@tanstack/react-query";
import { buildQueryString, pickAllowed } from "@/lib/queryString";
import { TRANSACTION_KINDS } from "@/types/finance.types";
import type { Metadata } from "next";
import { transactionsListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Transactions",
};

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>;
}) => {
  const kind = pickAllowed((await searchParams).kind, TRANSACTION_KINDS);

  // The filter is read here as well as in the board, so the first paint is the
  // view that was asked for rather than every row followed by a correction.
  const query = buildQueryString({ kind });

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(transactionsListQuery(query));

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
