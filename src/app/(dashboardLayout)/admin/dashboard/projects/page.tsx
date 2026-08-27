import ProjectsTable from "@/components/modules/Admin/Projects/ProjectsTable";
import { getProjects } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

const ProjectsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects", ""],
    queryFn: () => getProjects(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Work for clients. Payments, expenses and payouts can all be tied to one.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectsTable />
      </HydrationBoundary>
    </div>
  );
};

export default ProjectsPage;
