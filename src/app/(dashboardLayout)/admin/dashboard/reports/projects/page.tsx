import ProjectsReport from "@/components/modules/Admin/Reports/ProjectsReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { projectProfitabilityQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";
import ReportPeriodPicker from "@/components/modules/Admin/Reports/ReportPeriodPicker";
import { periodQueryString } from "@/lib/reportPeriod";

export const metadata: Metadata = {
  title: "Projects · Reports",
};

const ProjectsReportPage = async ({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  // The same from/to the period picker writes, so the prefetch lands on the key the cards ask for.
  const period = periodQueryString(await searchParams);

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(projectProfitabilityQuery(period)),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        Which projects made money. Received minus spent, per project — unpaid work is not profit.
      </PageHeader>
      <ReportViewTabs />
      <ReportPeriodPicker />

      <QueryPrefetch prefetch={prefetch}>
        <ProjectsReport period={period} />
      </QueryPrefetch>
    </div>
  );
};

export default ProjectsReportPage;
