import FinanceReport from "@/components/modules/Admin/Reports/FinanceReport";
import { getCashFlow } from "@/services/insights.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { expensesListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Finance report",
};

const FinanceReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery({ queryKey: ["report-cash-flow"], queryFn: () => getCashFlow() }),
    // Shares its key with the Expenses page, so arriving from there reuses it.
    queryClient.prefetchQuery(expensesListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-sm text-muted-foreground">
          Where the money went. Cash flow read straight off the ledger, so it cannot fall out of step with the modules that write it.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <FinanceReport />
      </QueryPrefetch>
    </div>
  );
};

export default FinanceReportPage;
