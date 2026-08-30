import FinanceReport from "@/components/modules/Admin/Reports/FinanceReport";
import { getCashFlow, getExpenses } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance report",
};

const FinanceReportPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["report-cash-flow"], queryFn: () => getCashFlow() }),
    // Shares its key with the Expenses page, so arriving from there reuses it.
    queryClient.prefetchQuery({ queryKey: ["expenses", ""], queryFn: () => getExpenses() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-sm text-muted-foreground">
          Where the money went. Cash flow read straight off the ledger, so it cannot fall out of step with the modules that write it.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <FinanceReport />
      </HydrationBoundary>
    </div>
  );
};

export default FinanceReportPage;
