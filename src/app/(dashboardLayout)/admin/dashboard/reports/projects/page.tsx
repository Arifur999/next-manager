import ProjectsReport from "@/components/modules/Admin/Reports/ProjectsReport";
import { getProjectProfitability } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project report",
};

const ProjectsReportPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["report-project-profitability"],
      queryFn: () => getProjectProfitability(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Which projects made money. Received minus spent, per project — unpaid work is not profit.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectsReport />
      </HydrationBoundary>
    </div>
  );
};

export default ProjectsReportPage;
