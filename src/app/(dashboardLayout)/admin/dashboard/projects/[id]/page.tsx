import ProjectDetail from "@/components/modules/Admin/Projects/ProjectDetail";
import { getProject, getProjectFinancials, getTasks } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project",
};

// Next 16 hands params in as a promise.
const ProjectDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  // Three prefetches in parallel rather than awaited one after another — the
  // page needs all three before it can paint, so serialising them would just
  // add two round-trips of latency.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project", id],
      queryFn: () => getProject(id),
      staleTime: 1000 * 30,
    }),
    queryClient.prefetchQuery({
      queryKey: ["project-financials", id],
      queryFn: () => getProjectFinancials(id),
      staleTime: 1000 * 30,
    }),
    queryClient.prefetchQuery({
      queryKey: ["tasks", `project_id=${id}`],
      queryFn: () => getTasks(`project_id=${id}`),
      staleTime: 1000 * 30,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetail projectId={id} />
    </HydrationBoundary>
  );
};

export default ProjectDetailPage;
