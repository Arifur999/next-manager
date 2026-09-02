import ProjectDetail from "@/components/modules/Admin/Projects/ProjectDetail";
import { getProject, getProjectFinancials, getTasks } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project",
};

// Next 16 hands params in as a promise.
const ProjectDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const queryClient = new QueryClient();
  const user = await getUserInfo();

  // The same two roles /projects/:id/financials allows. Sales opens this page
  // to see where a client's work has got to, not what it earns — and the check
  // lives here so the page never asks a question it would be refused.
  const canSeeMoney = user?.role === "admin" || user?.role === "project_manager";

  // Prefetched in parallel rather than one after another — the page needs them
  // all before it can paint, so serialising would just add round-trips.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project", id],
      queryFn: () => getProject(id),
      staleTime: 1000 * 30,
    }),
    queryClient.prefetchQuery({
      queryKey: ["tasks", `project_id=${id}`],
      queryFn: () => getTasks(`project_id=${id}`),
      staleTime: 1000 * 30,
    }),
    ...(canSeeMoney
      ? [
          queryClient.prefetchQuery({
            queryKey: ["project-financials", id],
            queryFn: () => getProjectFinancials(id),
            staleTime: 1000 * 30,
          }),
        ]
      : []),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetail projectId={id} canSeeMoney={canSeeMoney} />
    </HydrationBoundary>
  );
};

export default ProjectDetailPage;
