import BusinessReport from "@/components/modules/Admin/Reports/BusinessReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { monthlySeriesQuery, profitAndLossListQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Business report",
};

const BusinessReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(profitAndLossListQuery()),
    queryClient.prefetchQuery(monthlySeriesQuery(12)),
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

      <QueryPrefetch prefetch={prefetch}>
        <BusinessReport />
      </QueryPrefetch>
    </div>
  );
};

export default BusinessReportPage;
