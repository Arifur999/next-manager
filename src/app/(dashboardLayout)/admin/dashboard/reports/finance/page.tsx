import FinanceReport from "@/components/modules/Admin/Reports/FinanceReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { expensesListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { cashFlowQuery } from "@/queries/insights.queries";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";

export const metadata: Metadata = {
  title: "Finance · Reports",
};

const FinanceReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(cashFlowQuery()),
    // Shares its key with the Expenses page, so arriving from there reuses it.
    queryClient.prefetchQuery(expensesListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        Where the money went. Cash flow read straight off the ledger, so it cannot fall out of step with the modules that write it.
      </PageHeader>
      <ReportViewTabs />

      <QueryPrefetch prefetch={prefetch}>
        <FinanceReport />
      </QueryPrefetch>
    </div>
  );
};

export default FinanceReportPage;
