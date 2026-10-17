import ProjectsReport from "@/components/modules/Admin/Reports/ProjectsReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { projectProfitabilityQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Project report",
};

const ProjectsReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(projectProfitabilityQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Projects">
        Which projects made money. Received minus spent, per project — unpaid work is not profit.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <ProjectsReport />
      </QueryPrefetch>
    </div>
  );
};

export default ProjectsReportPage;
