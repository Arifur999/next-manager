import TransactionsBoard from "@/components/modules/Admin/Transactions/TransactionsBoard";
import { TRANSACTIONS_TABLE } from "@/components/modules/Admin/Transactions/transactionsTable.config";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { transactionsListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ViewTabs from "@/components/shared/ViewTabs";
import { TRANSACTION_VIEWS } from "@/lib/pageViews";

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
      <PageHeader title="Transactions">
        Every movement of money, written by whatever caused it — a payment, an expense,
        an exchange. Nothing is typed in here, which is why it can be trusted to agree
        with the records it summarises.
      </PageHeader>
      <ViewTabs label="Transaction views" tabs={TRANSACTION_VIEWS} />

      <QueryPrefetch prefetch={prefetch}>
        <TransactionsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default TransactionsPage;
