import TeamReport from "@/components/modules/Admin/Reports/TeamReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { kpiQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";

export const metadata: Metadata = {
  title: "Team · Reports",
};

const TeamReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(kpiQuery("delivery")),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        What each team spent its time on, and what it cost. Role cannot answer this — your designers and developers are all operations.
      </PageHeader>
      <ReportViewTabs />

      <QueryPrefetch prefetch={prefetch}>
        <TeamReport />
      </QueryPrefetch>
    </div>
  );
};

export default TeamReportPage;
