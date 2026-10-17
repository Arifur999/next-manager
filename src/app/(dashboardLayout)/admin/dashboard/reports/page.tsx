import BusinessReport from "@/components/modules/Admin/Reports/BusinessReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { monthlySeriesQuery, profitAndLossListQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";

export const metadata: Metadata = {
  title: "Business · Reports",
};

const BusinessReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(profitAndLossListQuery()),
    queryClient.prefetchQuery(monthlySeriesQuery(12)),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        USD and BDT are reported side by side and never added — combining them would need
        a rate baked invisibly into the headline.
      </PageHeader>
      <ReportViewTabs />

      <QueryPrefetch prefetch={prefetch}>
        <BusinessReport />
      </QueryPrefetch>
    </div>
  );
};

export default BusinessReportPage;
