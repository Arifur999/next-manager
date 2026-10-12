import LoansBoard from "@/components/modules/Admin/Loans/LoansBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { accountsQuery, loanSummaryQuery, loansListQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Loans",
};

const LoansPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(loansListQuery()),
    queryClient.prefetchQuery(loanSummaryQuery()),
    queryClient.prefetchQuery(accountsQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">
          Bank loans and EMIs — money lent between people belongs on Due Payments
          instead. Borrowed cash lands in a real account but is never revenue, and
          repaying it is only partly a cost: the principal was already owed, so only the
          interest counts against your profit.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <LoansBoard />
      </QueryPrefetch>
    </div>
  );
};

export default LoansPage;
