import BusinessReport from "@/components/modules/Admin/Reports/BusinessReport";
import { getMonthlySeries, getProfitAndLoss } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business report",
};

const BusinessReportPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["report-pl"], queryFn: () => getProfitAndLoss() }),
    queryClient.prefetchQuery({ queryKey: ["report-monthly"], queryFn: () => getMonthlySeries(12) }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business</h1>
        <p className="text-sm text-muted-foreground">
          USD and BDT are reported side by side and never added — combining them would need
          a rate baked invisibly into the headline.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <BusinessReport />
      </HydrationBoundary>
    </div>
  );
};

export default BusinessReportPage;
