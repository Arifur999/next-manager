import ReportsBoard from "@/components/modules/Admin/Reports/ReportsBoard";
import {
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
