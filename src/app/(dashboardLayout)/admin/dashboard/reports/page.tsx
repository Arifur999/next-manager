import ReportsBoard from "@/components/modules/Admin/Reports/ReportsBoard";
import {
  getCashFlow,
  getClientRevenue,
  getExpenses,
  getMonthlySeries,
  getProfitAndLoss,
  getProjectProfitability,
} from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
};

const ReportsPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["report-pl"], queryFn: () => getProfitAndLoss() }),
    queryClient.prefetchQuery({ queryKey: ["report-monthly"], queryFn: () => getMonthlySeries(12) }),
    queryClient.prefetchQuery({
      queryKey: ["report-project-profitability"],
      queryFn: () => getProjectProfitability(),
    }),
    queryClient.prefetchQuery({ queryKey: ["report-cash-flow"], queryFn: () => getCashFlow() }),
    queryClient.prefetchQuery({
      queryKey: ["report-client-revenue"],
      queryFn: () => getClientRevenue(),
    }),
    // Shares its key with the Expenses page, so arriving from there reuses it.
    queryClient.prefetchQuery({ queryKey: ["expenses", ""], queryFn: () => getExpenses() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          USD and BDT are reported side by side and never added — combining them would need a rate
          baked invisibly into the headline.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ReportsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default ReportsPage;
