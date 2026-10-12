import ProjectsReport from "@/components/modules/Admin/Reports/ProjectsReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { projectProfitabilityQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Project report",
};

const ProjectsReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(projectProfitabilityQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Which projects made money. Received minus spent, per project — unpaid work is not profit.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <ProjectsReport />
      </QueryPrefetch>
    </div>
  );
};

export default ProjectsReportPage;
